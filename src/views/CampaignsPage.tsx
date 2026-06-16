'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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
import { campaignChannelTextMap } from '../lib/labels'
import { useI18n } from '../i18n'
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
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const canEdit = session ? hasPermission(session.role, 'campaigns:edit') : false
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [presetName, setPresetName] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<CampaignStatus>('paused')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isNavigatingToDetail, setIsNavigatingToDetail] = useState(false)
  const showToast = useToastStore((state) => state.showToast)
  const filters = useMemo(
    () => parseCampaignFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  )
  const [searchInput, setSearchInput] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: ({ signal }) => getCampaigns({ signal }),
    placeholderData: keepPreviousData,
  })

  const presetsQuery = useQuery({
    queryKey: ['filter-presets'],
    queryFn: ({ signal }) => getFilterPresets({ signal }),
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
        title: `"${preset.name}" 프리셋을 저장했습니다.`,
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
        title: '프리셋을 삭제했습니다.',
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
        title: `${selectedCampaignIds.length}개 캠페인의 상태를 변경했습니다.`,
      })
      setSelectedCampaignIds([])
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const replaceSearchParams = useCallback((nextSearchParams: URLSearchParams) => {
    const query = nextSearchParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }, [pathname, router])

  useEffect(() => {
    if (isNavigatingToDetail) {
      return
    }

    if (debouncedSearch !== filters.search) {
      replaceSearchParams(
        buildCampaignSearchParams({
          ...filters,
          search: debouncedSearch,
          page: 1,
        }),
      )
    }
  }, [debouncedSearch, filters, isNavigatingToDetail, replaceSearchParams])

  const campaignRows = useMemo(
    () => campaignsQuery.data?.campaigns ?? [],
    [campaignsQuery.data],
  )
  const presets = presetsQuery.data?.presets ?? []

  const filteredCampaigns = useMemo(() => {
    const lowerSearch = debouncedSearch.toLowerCase()
    const filtered = campaignRows.filter((campaign) => {
      const channelLabel = campaignChannelTextMap[campaign.channel].toLowerCase()
      const matchesSearch =
        lowerSearch.length === 0 ||
        campaign.name.toLowerCase().includes(lowerSearch) ||
        campaign.managerName.toLowerCase().includes(lowerSearch) ||
        campaign.channel.toLowerCase().includes(lowerSearch) ||
        channelLabel.includes(lowerSearch)
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
  }, [
    campaignRows,
    debouncedSearch,
    filters.channel,
    filters.endDate,
    filters.sortBy,
    filters.sortDirection,
    filters.startDate,
    filters.status,
  ])

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

    replaceSearchParams(buildCampaignSearchParams(normalizedFilters))
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
    replaceSearchParams(buildCampaignSearchParams(nextFilters))
    showToast({
      tone: 'info',
      title: `"${preset.name}" 프리셋을 불러왔습니다.`,
    })
  }

  function handleDownloadCsv() {
    const csv = buildCampaignCsv(filteredCampaigns)
    downloadTextFile('mediaops-campaigns.csv', csv, 'text/csv;charset=utf-8')
    showToast({
      tone: 'info',
      title: `${filteredCampaigns.length}개 캠페인을 CSV로 다운로드했습니다.`,
    })
  }

  function handlePrefetch(campaignId: string) {
    void queryClient.prefetchQuery({
      queryKey: ['campaign-detail', campaignId],
      queryFn: ({ signal }) => getCampaignDetail(campaignId, { signal }),
    })
  }

  const handleNavigateToDetail = useCallback(() => {
    setIsNavigatingToDetail(true)
  }, [])

  const columns = createCampaignTableColumns({
    selectedIds: selectedCampaignIds,
    canEdit,
    onToggleSelected: handleToggleSelected,
    onPrefetch: handlePrefetch,
    onNavigateToDetail: handleNavigateToDetail,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    onSort: handleSort,
    t,
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
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t('campaigns.eyebrow')}
        title={t('campaigns.title')}
        description={t('campaigns.description')}
      />

      <section className="surface-card min-w-0 overflow-hidden p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,0.55fr))]">
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4 xl:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">{t('campaigns.control')}</p>
            <h3 className="mt-3 text-[clamp(1.35rem,5vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {t('campaigns.controlTitle')}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {t('campaigns.controlDesc')}
            </p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('campaigns.resultCount')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]" aria-live="polite" data-testid="campaign-results-count">
              {t('campaigns.resultCountValue', { count: filteredCampaigns.length })}
            </p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">조건에 맞는 활성 데이터</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('campaigns.savedPresets')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{presets.length}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">빠른 필터 재사용</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('campaigns.selectedItems')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{selectedCampaignIds.length}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">일괄 작업 대상</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{t('campaigns.filterToolbar')}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{t('campaigns.filterToolbarDesc')}</p>
          </div>
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          <Input
            label={t('campaigns.search')}
            aria-label={t('campaigns.search')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('campaigns.searchPlaceholder')}
          />
          <Select
            label={t('campaigns.status')}
            aria-label={t('campaigns.status')}
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as CampaignStatus | 'all',
              })
            }
          >
            <SelectOption value="all">{t('campaigns.allStatus')}</SelectOption>
            <SelectOption value="active">{t('labels.status.active')}</SelectOption>
            <SelectOption value="paused">{t('labels.status.paused')}</SelectOption>
            <SelectOption value="ended">{t('labels.status.ended')}</SelectOption>
          </Select>
          <Select
            label={t('campaigns.channel')}
            aria-label={t('campaigns.channel')}
            value={filters.channel}
            onChange={(event) =>
              updateFilters({
                channel: event.target.value as typeof filters.channel,
              })
            }
          >
            <SelectOption value="all">{t('campaigns.allChannels')}</SelectOption>
            <SelectOption value="google">{t('labels.channel.google')}</SelectOption>
            <SelectOption value="meta">{t('labels.channel.meta')}</SelectOption>
            <SelectOption value="naver">{t('labels.channel.naver')}</SelectOption>
            <SelectOption value="kakao">{t('labels.channel.kakao')}</SelectOption>
          </Select>
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(startDate) => updateFilters({ startDate })}
            onEndDateChange={(endDate) => updateFilters({ endDate })}
          />
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_repeat(5,minmax(0,auto))] xl:items-end">
          <Input
            label={t('campaigns.presetName')}
            aria-label={t('campaigns.presetName')}
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder={t('campaigns.presetPlaceholder')}
          />
          <Select
            label={t('campaigns.savedPresets')}
            aria-label={t('campaigns.savedPresets')}
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
          >
            <SelectOption value="">{t('campaigns.savedPresetSelect')}</SelectOption>
            {presets.map((preset: FilterPreset) => (
              <SelectOption key={preset.id} value={preset.id}>
                {preset.name}
              </SelectOption>
            ))}
          </Select>
          <Button
            variant="secondary"
            className="w-full xl:w-auto"
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
            {t('campaigns.savePreset')}
          </Button>
          <Button
            variant="secondary"
            className="w-full xl:w-auto"
            data-testid="load-preset-button"
            onClick={handleLoadPreset}
            disabled={!selectedPresetId}
          >
            {t('campaigns.loadPreset')}
          </Button>
          <Button
            variant="secondary"
            className="w-full xl:w-auto"
            data-testid="delete-preset-button"
            onClick={() => deletePresetMutation.mutate(selectedPresetId)}
            disabled={!selectedPresetId}
          >
            {t('campaigns.deletePreset')}
          </Button>
          <Button
            variant="secondary"
            className="w-full xl:w-auto"
            data-testid="download-csv-button"
            onClick={handleDownloadCsv}
          >
            {t('common.downloadCsv')}
          </Button>
          <Button
            variant="ghost"
            className="w-full xl:w-auto"
            data-testid="reset-filters-button"
            onClick={() => {
              setSearchInput(defaultCampaignFilters.search)
              replaceSearchParams(buildCampaignSearchParams(defaultCampaignFilters))
            }}
          >
            {t('common.reset')}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--border-subtle)] pt-5">
          <p className="text-sm leading-6 text-[var(--text-tertiary)]">
            {t('campaigns.toolbarHint')}
          </p>
          {canEdit ? (
            <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end xl:w-auto">
              <Select
                label={t('campaigns.bulkStatus')}
                value={bulkStatus}
                aria-label={t('campaigns.bulkStatus')}
                onChange={(event) =>
                  setBulkStatus(event.target.value as CampaignStatus)
                }
              >
                <SelectOption value="active">{t('labels.status.active')}</SelectOption>
                <SelectOption value="paused">{t('labels.status.paused')}</SelectOption>
                <SelectOption value="ended">{t('labels.status.ended')}</SelectOption>
              </Select>
              <Button
                className="w-full sm:w-auto"
                onClick={() => setConfirmOpen(true)}
                disabled={selectedCampaignIds.length === 0}
              >
                {t('campaigns.bulkChange')}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)]">
              {t('campaigns.readonly')}
            </p>
          )}
        </div>
      </section>

      {paginatedCampaigns.length === 0 ? (
        <EmptyState
          title={t('campaigns.emptyTitle')}
          description={t('campaigns.emptyDesc')}
        />
      ) : (
        <>
          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3.5">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t('campaigns.list')}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{t('campaigns.listDesc')}</p>
              </div>
            </div>
            <DataTable
              caption={t('campaigns.listCaption')}
              captionClassName="sr-only"
              columns={columns}
              rows={paginatedCampaigns}
              getRowKey={(campaign: Campaign) => campaign.id}
            />
          </section>
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
          title={t('campaigns.confirmTitle')}
          description={`${selectedCampaignIds.length} · ${t(`labels.status.${bulkStatus}`)}`}
          confirmLabel={t('campaigns.confirmLabel')}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => batchUpdateMutation.mutate(bulkStatus)}
        />
      ) : null}
    </div>
  )
}
