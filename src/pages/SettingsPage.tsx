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
    header: 'Preset',
    cell: (preset) => preset.name,
  },
  {
    id: 'createdAt',
    header: 'Created',
    cell: (preset) => new Date(preset.createdAt).toLocaleString(),
  },
]

export function SettingsPage() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()
  const theme = usePreferencesStore((state) => state.theme)
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar)
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
        title: 'Deleted preset.',
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
            Retry
          </Button>
        }
      />
    )
  }

  const presets = presetsQuery.data?.presets ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile and preferences"
        description="Persisted UI preferences, saved filter presets, and role-based access notes."
      />

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Current user</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">{session.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{session.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {roleLabels[session.role]}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <Button variant="secondary" onClick={toggleTheme} className="w-full">
              Theme: {theme}
            </Button>
            <Button variant="secondary" onClick={toggleSidebar} className="w-full">
              Sidebar: {sidebarCollapsed ? 'Collapsed' : 'Expanded'}
            </Button>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Role access</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(['admin', 'manager', 'viewer'] as const).map((role) => (
              <div key={role} className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{roleLabels[role]}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {role === 'admin'
                    ? 'All menus, edits, and settings user-management access.'
                    : role === 'manager'
                      ? 'Campaign edits, reports, and preference management.'
                      : 'Read-only access across campaign and report views.'}
                </p>
              </div>
            ))}
          </div>
          {hasPermission(session.role, 'settings:manage-users') ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-4">
              <p className="font-semibold text-slate-950">Admin-only user management</p>
              <p className="mt-2 text-sm text-slate-500">
                This placeholder section is visible only to admins, matching the permission policy.
              </p>
            </div>
          ) : null}
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Saved filter presets</p>
        {presets.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No saved presets"
              description="Create presets from the campaigns page to manage them here."
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
              <div className="flex flex-wrap gap-3">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="secondary"
                    onClick={() => deletePresetMutation.mutate(preset.id)}
                  >
                    Delete {preset.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Viewer access can review presets here, but deletion is disabled.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
