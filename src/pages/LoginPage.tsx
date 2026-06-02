import { startTransition, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { usePreferencesStore } from '../features/ui/preferences-store'
import { getLoginProfiles, loginWithProfile } from '../lib/api/mediaops'
import { roleLabels } from '../features/auth/permissions'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const theme = usePreferencesStore((state) => state.theme)
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
    <div
      className={`min-h-screen px-4 py-6 sm:px-6 lg:px-8 ${
        theme === 'dark' ? 'bg-[#0f1724]' : 'bg-slate-100'
      }`}
      data-theme={theme}
    >
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className={`rounded-[36px] px-6 py-8 shadow-[0_24px_100px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-900 text-white'}`}>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-200/90">
            미디어옵스 대시보드
          </p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.95] sm:text-6xl">
            광고 운영과 성과 분석을 한 화면에서 관리하는 대시보드
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
            React Router, Zustand, TanStack Query, Tailwind CSS, MSW를 기반으로
            실제 서비스처럼 동작하는 운영형 대시보드 구조를 구현했습니다.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className={`rounded-3xl p-4 ring-1 ${theme === 'dark' ? 'bg-slate-800 ring-slate-700' : 'bg-white/8 ring-white/10'}`}>
              <p className="text-sm text-slate-300">권한 제어</p>
              <p className="mt-2 text-2xl font-semibold">3개 역할</p>
            </div>
            <div className={`rounded-3xl p-4 ring-1 ${theme === 'dark' ? 'bg-slate-800 ring-slate-700' : 'bg-white/8 ring-white/10'}`}>
              <p className="text-sm text-slate-300">캠페인 분석</p>
              <p className="mt-2 text-2xl font-semibold">목록 + 상세</p>
            </div>
            <div className={`rounded-3xl p-4 ring-1 ${theme === 'dark' ? 'bg-slate-800 ring-slate-700' : 'bg-white/8 ring-white/10'}`}>
              <p className="text-sm text-slate-300">목업 API</p>
              <p className="mt-2 text-2xl font-semibold">MSW 기반</p>
            </div>
          </div>
        </section>

        <section className={`rounded-[36px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-8 ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            로그인
          </p>
          <h2 className={`mt-3 font-display text-4xl ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
            데모 계정을 선택하세요
          </h2>
          <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            선택한 역할에 따라 메뉴 노출과 가능한 액션이 달라집니다.
          </p>

          <div className="mt-8 space-y-3">
            {profilesQuery.isLoading && (
              <div className="space-y-3" aria-busy="true" aria-live="polite">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`profile-skeleton-${index}`}
                    className={`rounded-3xl border px-4 py-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-white'}`}
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
                title="계정 목록을 불러올 수 없습니다"
                message={profilesQuery.error.message}
                action={
                  <Button variant="secondary" onClick={() => profilesQuery.refetch()}>
                    다시 시도
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
                        ? theme === 'dark'
                          ? 'border-slate-700 bg-slate-800 text-slate-100'
                          : 'border-slate-900 bg-slate-900 text-white'
                        : theme === 'dark'
                          ? 'border-slate-800 bg-slate-900 hover:border-slate-700'
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
                          ? theme === 'dark'
                            ? 'bg-slate-700 text-slate-100'
                            : 'bg-white/10 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-800 text-slate-300'
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
                      ? '모든 메뉴와 모든 기능 사용 가능'
                      : profile.role === 'manager'
                        ? '캠페인 수정과 리포트 확인 가능'
                        : '조회 전용으로 일부 액션 제한'}
                  </p>
                </button>
              )
            })}
          </div>

          <div className={`mt-8 rounded-3xl p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <p className={`text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
              선택된 권한
            </p>
            <p className={`mt-2 text-lg font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
              {activeProfile ? roleLabels[activeProfile.role] : '선택 없음'}
            </p>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeProfile
                ? activeProfile.role === 'viewer'
                  ? '조회 전용 계정은 대시보드, 캠페인, 리포트, 설정 화면을 읽기 전용으로 확인할 수 있습니다.'
                  : '캠페인, 리포트, 설정 화면까지 접근할 수 있습니다.'
                : '계정을 선택한 뒤 진행하세요.'}
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
            {loginMutation.isPending ? '로그인 중...' : '대시보드 입장'}
          </Button>
        </section>
      </div>
    </div>
  )
}
