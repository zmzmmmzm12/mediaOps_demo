'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { hasPermission } from '../features/auth/permissions'
import { usePreferencesStore } from '../features/ui/preferences-store'
import { useToastStore } from '../features/ui/toast-store'
import { deleteFilterPreset, getFilterPresets } from '../lib/api/mediaops'
import type { FilterPreset } from '../types/mediaops'
import { useI18n } from '../i18n'

function createPresetColumns(t: (key: string) => string): Array<DataTableColumn<FilterPreset>> {
  return [
  {
    id: 'name',
    header: t('campaigns.presetName'),
    cell: (preset) => preset.name,
  },
  {
    id: 'createdAt',
    header: t('common.save'),
    cell: (preset) => new Date(preset.createdAt).toLocaleString(),
  },
  ]
}

export function SettingsPage() {
  const { t } = useI18n()
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
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  const presets = presetsQuery.data?.presets ?? []
  const presetColumns = createPresetColumns(t)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <section className="surface-card min-w-0 overflow-hidden p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">{t('settings.personal')}</p>
            <h3 className="mt-3 text-[clamp(1.35rem,5vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{t('settings.personalTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {t('settings.personalDesc')}
            </p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('settings.currentRole')}</p>
            <p className="mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{t(`labels.role.${session.role}`)}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">접근 가능한 메뉴 기준</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('settings.activeTheme')}</p>
            <p className="mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{theme === 'dark' ? t('common.darkMode') : t('common.lightMode')}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">개인 환경설정</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('settings.savedPresets')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{presets.length}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">필터 조건 재사용</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.05fr)]">
        <article className="surface-card p-5">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-lg font-semibold text-[var(--brand)]">
              {session.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-[var(--text-tertiary)]">{t('settings.currentUser')}</p>
              <h3 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">{session.email}</p>
              <span className="mt-3 inline-flex rounded-full bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]">
                {t(`labels.role.${session.role}`)}
              </span>
            </div>
          </div>

          <div className="surface-muted mt-5 p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('settings.theme')}</p>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              {t('settings.themeDesc')}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`focus-ring rounded-xl border p-4 text-left ${
                  theme === 'light'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <p className="text-sm font-semibold">{t('common.lightMode')}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">밝고 선명한 관리자 화면</p>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`focus-ring rounded-xl border p-4 text-left ${
                  theme === 'dark'
                    ? 'border-indigo-400/50 bg-[var(--brand-soft)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-secondary)]'
                }`}
              >
                <p className="text-sm font-semibold">{t('common.darkMode')}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">낮은 대비의 집중형 화면</p>
              </button>
            </div>
          </div>
        </article>

        <article className="surface-card p-5">
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">{t('settings.roleScope')}</p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{t('settings.roleScopeTitle')}</h3>
          </div>
          <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-3">
            {(['admin', 'manager', 'viewer'] as const).map((role) => (
              <div key={role} className="surface-muted min-w-0 p-4">
                <p className="font-semibold text-[var(--text-primary)]">{t(`labels.role.${role}`)}</p>
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
            <div className="surface-muted mt-5 p-4">
              <p className="font-semibold text-[var(--text-primary)]">{t('settings.adminArea')}</p>
              <p className="mt-2 text-sm text-[var(--text-tertiary)]">
                {t('settings.adminAreaDesc')}
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">{t('settings.savedPresets')}</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('settings.presetArchive')}</h3>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            {t('settings.presetArchiveDesc')}
          </p>
        </div>
        {presets.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={t('settings.emptyPresets')}
              description={t('settings.emptyPresetsDesc')}
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
