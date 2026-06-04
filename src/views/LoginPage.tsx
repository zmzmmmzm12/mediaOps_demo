'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { usePreferencesStore } from '../features/ui/preferences-store'
import { getLoginProfiles, loginWithProfile } from '../lib/api/mediaops'
import { roleLabels } from '../features/auth/permissions'

export function LoginPage() {
  const router = useRouter()
  const session = useAuthStore((state) => state.session)
  const setSession = useAuthStore((state) => state.setSession)
  const theme = usePreferencesStore((state) => state.theme)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    }
  }, [router, session])

  const profilesQuery = useQuery({
    queryKey: ['auth-profiles'],
    queryFn: getLoginProfiles,
  })

  const loginMutation = useMutation({
    mutationFn: loginWithProfile,
    onSuccess: ({ user }) => {
      setSession(user)
      router.replace('/dashboard')
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
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 sm:px-6 lg:px-8" data-theme={theme}>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-stretch gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card relative flex min-h-[680px] flex-col justify-between overflow-hidden p-5 sm:p-7">
          <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-[var(--brand-soft)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-80px] left-[-40px] h-56 w-56 rounded-full bg-[var(--panel-subtle)] blur-3xl" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
              MediaOps
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-[64px] sm:leading-[1.03]">
              성과 운영을 위한
              <br />
              깔끔한 관리자 대시보드
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              SEO 메타데이터가 적용된 Next.js 기반 구조로 전환하고, 광고 운영 실무에 맞춘
              데이터 밀도와 시각적 계층을 다시 설계했습니다.
            </p>
          </div>

          <div className="relative mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="surface-muted p-4">
                <p className="text-sm text-[var(--text-tertiary)]">권한 제어</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">3개 역할</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm text-[var(--text-tertiary)]">캠페인 분석</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">목록 + 상세</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-sm text-[var(--text-tertiary)]">다국어 문구</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">한/영 정리</p>
              </div>
            </div>
            <div className="relative min-h-[420px]">
              <div className="absolute left-0 top-10 w-[72%] rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-bg)] p-4 shadow-[var(--shadow-md)] backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">운영 개요</p>
                    <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">광고 운영 현황</p>
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-strong)]">실시간</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-muted p-4">
                    <p className="text-xs text-[var(--text-tertiary)]">주간 매출</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">₩14,869.95</p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-xs text-[var(--text-tertiary)]">티켓 전환</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">24,580</p>
                  </div>
                </div>
                <div className="mt-4 h-32 rounded-xl bg-[var(--panel-muted)] p-3">
                  <div className="flex h-full items-end gap-2">
                    {Array.from({ length: 18 }).map((_, index) => (
                      <span
                        key={`hero-bar-${index}`}
                        className="w-full rounded-full bg-indigo-400/70"
                        style={{ height: `${28 + ((index * 7) % 58)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-[56%] rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-bg)] p-4 shadow-[var(--shadow-md)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">부서별 리포트</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['재무', '56.6%'],
                    ['홈&리빙', '42.1%'],
                    ['헬스', '39.2%'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[var(--panel-muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--brand)]"
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            로그인
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            데모 계정을 선택하세요
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
            선택한 역할에 따라 메뉴 노출과 가능한 액션이 달라집니다.
          </p>

          <div className="mt-8 space-y-3">
            {profilesQuery.isLoading && (
              <div className="space-y-3" aria-busy="true" aria-live="polite">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`profile-skeleton-${index}`} className="surface-muted p-4">
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
              const isSelected = (selectedUserId ?? profiles[0]?.id) === profile.id

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedUserId(profile.id)}
                  aria-pressed={isSelected}
                  data-testid={`login-profile-${profile.role}`}
                  className={`focus-ring w-full rounded-xl border p-4 text-left ${
                    isSelected
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                      : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] hover:bg-[var(--panel-muted)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{profile.name}</p>
                      <p className="text-sm text-[var(--text-tertiary)]">{profile.email}</p>
                    </div>
                    <span className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]">
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
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

          <div className="surface-muted mt-7 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              선택된 권한
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {activeProfile ? roleLabels[activeProfile.role] : '선택 없음'}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-tertiary)]">
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
            loading={loginMutation.isPending}
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
