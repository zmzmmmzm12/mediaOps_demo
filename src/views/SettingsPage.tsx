'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { hasPermission, roleLabels } from '../features/auth/permissions'
import { usePreferencesStore } from '../features/ui/preferences-store'
import { useToastStore } from '../features/ui/toast-store'
import { deleteFilterPreset, getFilterPresets } from '../lib/api/mediaops'
import type { FilterPreset } from '../types/mediaops'

const presetColumns: Array<DataTableColumn<FilterPreset>> = [
  {
    id: 'name',
    header: '프리셋 이름',
    cell: (preset) => preset.name,
  },
  {
    id: 'createdAt',
    header: '저장 일시',
    cell: (preset) => new Date(preset.createdAt).toLocaleString(),
  },
]

export function SettingsPage() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()
  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const showToast = useToastStore((state) => state.showToast)
  const canManagePresets = hasPermission(session?.role ?? 'viewer', 'campaigns:edit')

  const presetsQuery = useQuery({
    queryKey: ['filter-presets'],
    queryFn: getFilterPresets,
  })

  const deletePresetMutation = useMutation({
    mutationFn: deleteFilterPreset,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['filter-presets'] })
      showToast({
        tone: 'info',
        title: '프리셋을 삭제했습니다.',
      })
    },
  })

  if (!session) {
    return null
  }

  if (presetsQuery.isLoading) {
    return <PageSkeleton />
  }

  if (presetsQuery.isError) {
    return (
      <ErrorStatePanel
        message={presetsQuery.error.message}
        action={
          <Button variant="secondary" onClick={() => presetsQuery.refetch()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  const presets = presetsQuery.data?.presets ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="설정"
        title="프로필과 개인화 설정"
        description="테마, 권한 범위, 저장된 프리셋을 한 자리에서 관리합니다."
      />

      <section className="surface-card overflow-hidden px-6 py-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="surface-muted px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-300">개인 설정</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">운영 환경과 개인 설정</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              현재 계정 역할, 테마, 프리셋 보관함을 같은 톤의 관리자 화면에서 관리할 수 있게 정리했습니다.
            </p>
          </div>
          <div className="surface-muted px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">현재 역할</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{roleLabels[session.role]}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">접근 가능한 메뉴 기준</p>
          </div>
          <div className="surface-muted px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">활성 테마</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{theme === 'dark' ? '다크' : '라이트'}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">개인 환경설정</p>
          </div>
          <div className="surface-muted px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">저장 프리셋</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{presets.length}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">필터 조건 재사용</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
        <article className="surface-card px-6 py-6">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand)]">
              {session.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-[var(--text-tertiary)]">현재 사용자</p>
              <h3 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">{session.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]">
                {roleLabels[session.role]}
              </span>
            </div>
          </div>

          <div className="surface-muted mt-6 px-4 py-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">테마</p>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              포트폴리오와 실무 시연에 적합한 관리자 화면 테마를 선택합니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`focus-ring rounded-2xl border px-4 py-4 text-left ${
                  theme === 'light'
                    ? 'border-indigo-300 bg-indigo-50 text-slate-900'
                    : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <p className="text-sm font-semibold">라이트</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">밝고 선명한 관리자 화면</p>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`focus-ring rounded-2xl border px-4 py-4 text-left ${
                  theme === 'dark'
                    ? 'border-indigo-400/50 bg-[var(--brand-soft)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <p className="text-sm font-semibold">다크</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">낮은 대비의 집중형 화면</p>
              </button>
            </div>
          </div>
        </article>

        <article className="surface-card px-6 py-6">
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">권한별 접근 범위</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">역할별 사용 범위</h3>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(['admin', 'manager', 'viewer'] as const).map((role) => (
              <div key={role} className="surface-muted px-4 py-4">
                <p className="font-semibold text-[var(--text-primary)]">{roleLabels[role]}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-tertiary)]">
                  {role === 'admin'
                    ? '전체 메뉴 접근, 수정 권한, 설정 확장 영역까지 모두 사용할 수 있습니다.'
                    : role === 'manager'
                      ? '캠페인 수정, 리포트 확인, 개인 설정 관리가 가능합니다.'
                      : '읽기 중심으로 대시보드, 캠페인, 리포트, 설정을 확인할 수 있습니다.'}
                </p>
              </div>
            ))}
          </div>
          {hasPermission(session.role, 'settings:manage-users') ? (
            <div className="surface-muted mt-5 px-4 py-4">
              <p className="font-semibold text-[var(--text-primary)]">관리자 전용 영역</p>
              <p className="mt-2 text-sm text-[var(--text-tertiary)]">
                사용자 관리, 승인 정책, 운영 워크플로 확장 기능을 연결하기 좋은 위치입니다.
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="surface-card px-6 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">저장된 필터 프리셋</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">프리셋 보관함</h3>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            캠페인 화면에서 저장한 필터 조건을 다시 관리합니다.
          </p>
        </div>
        {presets.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="저장된 프리셋이 없습니다"
              description="캠페인 화면에서 프리셋을 저장하면 여기서 관리할 수 있습니다."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <DataTable
              caption="저장된 프리셋 목록"
              columns={presetColumns}
              rows={presets}
              getRowKey={(preset) => preset.id}
            />
            {canManagePresets ? (
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="secondary"
                    buttonSize="sm"
                    onClick={() => deletePresetMutation.mutate(preset.id)}
                  >
                    {preset.name} 삭제
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">
                조회 전용 계정은 프리셋을 확인할 수 있지만 삭제는 할 수 없습니다.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
