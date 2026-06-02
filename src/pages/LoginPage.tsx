import { startTransition, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { getLoginProfiles, loginWithProfile } from '../lib/api/mediaops'
import { roleLabels } from '../features/auth/permissions'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const profilesQuery = useQuery({
    queryKey: ['auth-profiles'],
    queryFn: getLoginProfiles,
  })

  const loginMutation = useMutation({
    mutationFn: loginWithProfile,
    onSuccess: ({ user }) => {
      setSession(user)
      startTransition(() => navigate('/dashboard', { replace: true }))
    },
  })

  const profiles = profilesQuery.data?.profiles ?? []
  const activeProfile =
    profiles.find((profile) => profile.id === selectedUserId) ?? profiles[0] ?? null

  function handleSubmit() {
    const userId = selectedUserId ?? profiles[0]?.id

    if (!userId) {
      return
    }

    loginMutation.mutate(userId)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_28%),linear-gradient(180deg,_#fffef8_0%,_#f1e7d8_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[36px] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_100px_rgba(15,23,42,0.24)] sm:px-8 sm:py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-200/90">
            MediaOps Dashboard
          </p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.95] sm:text-6xl">
            One mock control room for performance, pacing, and access.
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
            This baseline app ships with React Router, Zustand, TanStack Query,
            Tailwind CSS, and MSW-backed mock APIs so the dashboard runs cleanly
            in `npm run dev`.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
              <p className="text-sm text-slate-300">Mock auth</p>
              <p className="mt-2 text-2xl font-semibold">3 roles</p>
            </div>
            <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
              <p className="text-sm text-slate-300">Campaign views</p>
              <p className="mt-2 text-2xl font-semibold">List + detail</p>
            </div>
            <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
              <p className="text-sm text-slate-300">Network layer</p>
              <p className="mt-2 text-2xl font-semibold">MSW intercept</p>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Sign in
          </p>
          <h2 className="mt-3 font-display text-4xl text-slate-950">
            Choose a mock profile
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Each profile changes menu visibility and available API responses.
          </p>

          <div className="mt-8 space-y-3">
            {profilesQuery.isLoading && (
              <div className="space-y-3" aria-busy="true" aria-live="polite">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`profile-skeleton-${index}`}
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="mt-3 h-4 w-52" />
                    <Skeleton className="mt-4 h-4 w-56" />
                  </div>
                ))}
              </div>
            )}

            {profilesQuery.isError && (
              <ErrorStatePanel
                title="Profiles unavailable"
                message={profilesQuery.error.message}
                action={
                  <Button variant="secondary" onClick={() => profilesQuery.refetch()}>
                    Retry
                  </Button>
                }
              />
            )}

            {profiles.map((profile) => {
              const isSelected =
                (selectedUserId ?? profiles[0]?.id) === profile.id

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedUserId(profile.id)}
                  aria-pressed={isSelected}
                  data-testid={`login-profile-${profile.role}`}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{profile.name}</p>
                      <p
                        className={`text-sm ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {profile.email}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                  <p
                    className={`mt-3 text-sm ${
                      isSelected ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {profile.role === 'admin'
                      ? 'All menus and all actions'
                      : profile.role === 'manager'
                        ? 'Campaign edits and report access'
                        : 'Read-only views with restricted actions'}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-8 rounded-3xl bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Selected scope
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {activeProfile ? roleLabels[activeProfile.role] : 'No profile'}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {activeProfile
                ? activeProfile.role === 'viewer'
                  ? 'Viewer can browse dashboard, campaigns, reports, and settings in read-only mode.'
                  : 'Campaign, report, and settings routes are available.'
                : 'Choose a profile to continue.'}
            </p>
          </div>

          {loginMutation.error && (
            <p className="mt-4 text-sm text-red-600">
              {loginMutation.error.message}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={profilesQuery.isLoading || loginMutation.isPending}
            className="mt-6 w-full"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Enter dashboard'}
          </Button>
        </section>
      </div>
    </div>
  )
}
