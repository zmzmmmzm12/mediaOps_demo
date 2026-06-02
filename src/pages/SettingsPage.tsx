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
        description="프로필, 테마, 프리셋, 권한 범위를 한 화면에서 정리합니다."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className={`rounded-[28px] border p-6 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start gap-4">
            <span className={`inline-flex h-14 w-14 items-center justify-center rounded-[20px] text-lg font-semibold ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
              {session.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>현재 사용자</p>
              <h3 className={`mt-1 text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{session.name}</h3>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{session.email}</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-700'}`}>
                {roleLabels[session.role]}
              </span>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <div className={`rounded-[24px] border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>화면 테마</p>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                선호하는 시각 스타일을 선택하세요.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-[20px] border px-4 py-4 text-left transition ${
                    theme === 'light'
                      ? 'border-teal-500 bg-teal-50 text-slate-900'
                      : theme === 'dark'
                        ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold">라이트</p>
                  <p className={`mt-1 text-xs ${theme === 'light' ? 'text-slate-600' : theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                    밝고 선명한 기본 화면
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-[20px] border px-4 py-4 text-left transition ${
                    theme === 'dark'
                      ? 'border-teal-500 bg-slate-900 text-slate-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold">다크</p>
                  <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    낮은 대비로 차분한 화면
                  </p>
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className={`rounded-[28px] border p-6 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>권한별 접근 범위</p>
              <h3 className={`mt-1 text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>역할별 사용 범위</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(['admin', 'manager', 'viewer'] as const).map((role) => (
              <div key={role} className={`rounded-[24px] border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{roleLabels[role]}</p>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {role === 'admin'
                    ? '모든 메뉴 접근과 수정 기능, 설정의 관리자 영역까지 접근 가능합니다.'
                    : role === 'manager'
                      ? '캠페인 수정, 리포트 확인, 개인 설정 관리가 가능합니다.'
                      : '캠페인과 리포트 화면을 읽기 전용으로 확인할 수 있습니다.'}
                </p>
              </div>
            ))}
          </div>
          {hasPermission(session.role, 'settings:manage-users') ? (
            <div className={`mt-6 rounded-[24px] border p-4 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>관리자 전용 영역</p>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                사용자 관리나 운영 정책 확장 기능을 붙이기 좋은 자리입니다.
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className={`rounded-[28px] border p-6 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>저장된 필터 프리셋</p>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>프리셋 보관함</h3>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            자주 쓰는 검색 조건을 여기서 관리합니다.
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
                    onClick={() => deletePresetMutation.mutate(preset.id)}
                  >
                    {preset.name} 삭제
                  </Button>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                조회 전용 계정은 프리셋을 확인할 수 있지만 삭제는 할 수 없습니다.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
