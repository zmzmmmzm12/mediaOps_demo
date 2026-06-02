import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DataTable } from '../components/ui/DataTable'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { Button } from '../components/ui/Button'
import { Select, SelectOption } from '../components/ui/Select'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { createCampaignTableColumns } from '../features/campaigns/campaign-table-columns'
import { buildCampaignCsv } from '../features/campaigns/csv'
import { useAuthStore } from '../features/auth/auth-store'
import { hasPermission } from '../features/auth/permissions'
import {
  buildCampaignSearchParams,
  defaultCampaignFilters,
  parseCampaignFilters,
} from '../features/campaigns/url-state'
import { useToastStore } from '../features/ui/toast-store'
import { downloadTextFile } from '../lib/download'
import {
  createFilterPreset,
  deleteFilterPreset,
  getCampaignDetail,
  getCampaigns,
  getFilterPresets,
  updateCampaign,
} from '../lib/api/mediaops'
import type {
  Campaign,
  CampaignStatus,
  FilterPreset,
  FilterPresetsResponse,
} from '../types/mediaops'

export function CampaignsPage() {
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const canEdit = session ? hasPermission(session.role, 'campaigns:edit') : false
  const [searchParams, setSearchParams] = useSearchParams()
  const [presetName, setPresetName] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<CampaignStatus>('paused')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const showToast = useToastStore((state) => state.showToast)
  const filters = useMemo(() => parseCampaignFilters(searchParams), [searchParams])
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
    placeholderData: keepPreviousData,
  })

  const presetsQuery = useQuery({
    queryKey: ['filter-presets'],
    queryFn: getFilterPresets,
  })

  const savePresetMutation = useMutation({
    mutationFn: createFilterPreset,
    onSuccess: ({ preset }) => {
      queryClient.setQueryData<FilterPresetsResponse>(
        ['filter-presets'],
        (current) => ({
          presets: [
            preset,
            ...(current?.presets ?? []).filter((item) => item.id !== preset.id),
          ],
        }),
      )
      void queryClient.invalidateQueries({ queryKey: ['filter-presets'] })
      setSelectedPresetId(preset.id)
      setPresetName(preset.name)
      showToast({
        tone: 'success',
        title: `Saved preset "${preset.name}".`,
      })
    },
  })

  const deletePresetMutation = useMutation({
    mutationFn: deleteFilterPreset,
    onSuccess: (_response, presetId) => {
      queryClient.setQueryData<FilterPresetsResponse>(
        ['filter-presets'],
        (current) => ({
          presets: (current?.presets ?? []).filter((item) => item.id !== presetId),
        }),
      )
      void queryClient.invalidateQueries({ queryKey: ['filter-presets'] })
      setSelectedPresetId('')
      showToast({
        tone: 'info',
        title: 'Deleted preset.',
      })
    },
  })

  const batchUpdateMutation = useMutation({
    mutationFn: async (nextStatus: CampaignStatus) => {
      await Promise.all(
        selectedCampaignIds.map((campaignId) =>
          updateCampaign(campaignId, { status: nextStatus }),
        ),
      )
    },
    onSuccess: () => {
      showToast({
        tone: 'success',
        title: `Updated ${selectedCampaignIds.length} campaign${selectedCampaignIds.length > 1 ? 's' : ''} to ${bulkStatus}.`,
      })
      setSelectedCampaignIds([])
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setSearchParams(
        buildCampaignSearchParams({
          ...filters,
          search: debouncedSearch,
          page: 1,
        }),
        { replace: true },
      )
    }
  }, [debouncedSearch, filters, setSearchParams])

  const campaignRows = useMemo(
    () => campaignsQuery.data?.campaigns ?? [],
    [campaignsQuery.data],
  )
  const presets = presetsQuery.data?.presets ?? []

  const filteredCampaigns = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase()
    const filtered = campaignRows.filter((campaign) => {
      const matchesSearch =
        lowerSearch.length === 0 ||
        campaign.name.toLowerCase().includes(lowerSearch) ||
        campaign.managerName.toLowerCase().includes(lowerSearch)
      const matchesStatus =
        filters.status === 'all' || campaign.status === filters.status
      const matchesChannel =
        filters.channel === 'all' || campaign.channel === filters.channel
      const matchesStartDate =
        !filters.startDate || new Date(campaign.startDate) >= new Date(filters.startDate)
      const matchesEndDate =
        !filters.endDate || new Date(campaign.endDate) <= new Date(filters.endDate)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesChannel &&
        matchesStartDate &&
        matchesEndDate
      )
    })

    return filtered.sort((left, right) => {
      const modifier = filters.sortDirection === 'asc' ? 1 : -1
      return (left[filters.sortBy] - right[filters.sortBy]) * modifier
    })
  }, [campaignRows, debouncedSearch, filters.channel, filters.endDate, filters.sortBy, filters.sortDirection, filters.startDate, filters.status])

  const paginatedCampaigns = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize
    return filteredCampaigns.slice(start, start + filters.pageSize)
  }, [filteredCampaigns, filters.page, filters.pageSize])

  function updateFilters(patch: Partial<typeof filters>) {
    const nextFilters = {
      ...filters,
      ...patch,
    }

    const normalizedFilters = {
      ...nextFilters,
      page: patch.page ?? (Object.keys(patch).length === 1 && 'page' in patch ? nextFilters.page : 1),
    }

    setSearchParams(buildCampaignSearchParams(normalizedFilters), { replace: true })
  }

  function handleSort(field: 'revenue' | 'spend' | 'roas' | 'conversionRate') {
    updateFilters({
      sortBy: field,
      sortDirection:
        filters.sortBy === field && filters.sortDirection === 'desc'
          ? 'asc'
          : 'desc',
    })
  }

  function handleToggleSelected(campaignId: string) {
    setSelectedCampaignIds((current) =>
      current.includes(campaignId)
        ? current.filter((id) => id !== campaignId)
        : [...current, campaignId],
    )
  }

  function handleLoadPreset() {
    const preset = presets.find((item) => item.id === selectedPresetId)

    if (!preset) {
      return
    }

    const nextFilters = parseCampaignFilters(
      new URLSearchParams(preset.filters),
    )
    setSearchInput(nextFilters.search)
    setSearchParams(buildCampaignSearchParams(nextFilters), { replace: true })
    showToast({
      tone: 'info',
      title: `Loaded preset "${preset.name}".`,
    })
  }

  function handleDownloadCsv() {
    const csv = buildCampaignCsv(filteredCampaigns)
    downloadTextFile('mediaops-campaigns.csv', csv, 'text/csv;charset=utf-8')
    showToast({
      tone: 'info',
      title: `Downloaded ${filteredCampaigns.length} campaigns as CSV.`,
    })
  }

  function handlePrefetch(campaignId: string) {
    void queryClient.prefetchQuery({
      queryKey: ['campaign-detail', campaignId],
      queryFn: () => getCampaignDetail(campaignId),
    })
  }

  const columns = createCampaignTableColumns({
    selectedIds: selectedCampaignIds,
    canEdit,
    onToggleSelected: handleToggleSelected,
    onPrefetch: handlePrefetch,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    onSort: handleSort,
  })

  if (campaignsQuery.isLoading) {
    return <PageSkeleton />
  }

  if (campaignsQuery.isError) {
    return (
      <ErrorStatePanel
        message={campaignsQuery.error.message}
        action={
          <Button variant="secondary" onClick={() => campaignsQuery.refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campaigns"
        title="Campaign explorer"
        description="Search, filter, sort, paginate, save presets, and bulk-update campaign status."
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="grid gap-3 lg:grid-cols-5">
          <Input
            label="Search campaigns"
            aria-label="Search campaigns"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by campaign or manager"
          />
          <Select
            label="Status"
            aria-label="Status"
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as CampaignStatus | 'all',
              })
            }
          >
            <SelectOption value="all">All statuses</SelectOption>
            <SelectOption value="active">Active</SelectOption>
            <SelectOption value="paused">Paused</SelectOption>
            <SelectOption value="ended">Ended</SelectOption>
          </Select>
          <Select
            label="Channel"
            aria-label="Channel"
            value={filters.channel}
            onChange={(event) =>
              updateFilters({
                channel: event.target.value as typeof filters.channel,
              })
            }
          >
            <SelectOption value="all">All channels</SelectOption>
            <SelectOption value="google">Google</SelectOption>
            <SelectOption value="meta">Meta</SelectOption>
            <SelectOption value="naver">Naver</SelectOption>
            <SelectOption value="kakao">Kakao</SelectOption>
          </Select>
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(startDate) => updateFilters({ startDate })}
            onEndDateChange={(endDate) => updateFilters({ endDate })}
          />
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_240px_auto_auto_auto_auto_auto]">
          <Input
            label="Preset name"
            aria-label="Preset name"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="Preset name"
          />
          <Select
            label="Saved presets"
            aria-label="Saved presets"
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
          >
            <SelectOption value="">Saved presets</SelectOption>
            {presets.map((preset: FilterPreset) => (
              <SelectOption key={preset.id} value={preset.id}>
                {preset.name}
              </SelectOption>
            ))}
          </Select>
          <Button
            variant="secondary"
            data-testid="save-preset-button"
            onClick={() =>
              savePresetMutation.mutate({
                name: presetName,
                filters: Object.fromEntries(
                  buildCampaignSearchParams({
                    ...filters,
                    search: searchInput.trim(),
                  }).entries(),
                ),
              })
            }
          >
            Save preset
          </Button>
          <Button
            variant="secondary"
            data-testid="load-preset-button"
            onClick={handleLoadPreset}
            disabled={!selectedPresetId}
          >
            Load preset
          </Button>
          <Button
            variant="secondary"
            data-testid="delete-preset-button"
            onClick={() => deletePresetMutation.mutate(selectedPresetId)}
            disabled={!selectedPresetId}
          >
            Delete preset
          </Button>
          <Button
            variant="secondary"
            data-testid="download-csv-button"
            onClick={handleDownloadCsv}
          >
            Download CSV
          </Button>
          <Button
            variant="secondary"
            data-testid="reset-filters-button"
            onClick={() => {
              setSearchInput(defaultCampaignFilters.search)
              setSearchParams(buildCampaignSearchParams(defaultCampaignFilters), {
                replace: true,
              })
            }}
          >
            Reset
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-sm text-slate-500"
            aria-live="polite"
            data-testid="campaign-results-count"
          >
            {filteredCampaigns.length} campaigns match the current filters.
          </p>
          {canEdit ? (
            <div className="flex items-center gap-3">
              <Select
                label="Bulk status"
                value={bulkStatus}
                aria-label="Bulk status"
                onChange={(event) =>
                  setBulkStatus(event.target.value as CampaignStatus)
                }
              >
                <SelectOption value="active">Set active</SelectOption>
                <SelectOption value="paused">Set paused</SelectOption>
                <SelectOption value="ended">Set ended</SelectOption>
              </Select>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={selectedCampaignIds.length === 0}
              >
                Bulk status change
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Viewer access can explore data but cannot change campaign state.
            </p>
          )}
        </div>
      </section>

      {paginatedCampaigns.length === 0 ? (
        <EmptyState
          title="No campaigns match these filters"
          description="Try broadening the search, channel, or date range."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paginatedCampaigns}
            getRowKey={(campaign: Campaign) => campaign.id}
          />
          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            total={filteredCampaigns.length}
            onPageChange={(page) => updateFilters({ page })}
          />
        </>
      )}

      {canEdit ? (
        <ConfirmDialog
          open={confirmOpen}
          title="Change campaign status"
          description={`Apply "${bulkStatus}" to ${selectedCampaignIds.length} selected campaign${selectedCampaignIds.length === 1 ? '' : 's'}?`}
          confirmLabel="Apply change"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => batchUpdateMutation.mutate(bulkStatus)}
        />
      ) : null}
    </div>
  )
}
