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
import { usePreferencesStore } from '../features/ui/preferences-store'
import { useToastStore } from '../features/ui/toast-store'
import { downloadTextFile } from '../lib/download'
import { campaignStatusTextMap } from '../lib/labels'
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
  const theme = usePreferencesStore((state) => state.theme)
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
    theme,
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
            다시 시도
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="캠페인"
        title="캠페인 탐색기"
        description="검색, 필터, 정렬, 페이지네이션, 프리셋 저장, 일괄 상태 변경까지 한 화면에서 처리합니다."
      />

      <section
        className={`rounded-[28px] border p-5 ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="grid gap-3 lg:grid-cols-5">
          <Input
            label="캠페인 검색"
            aria-label="캠페인 검색"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="캠페인명 또는 담당자로 검색"
          />
          <Select
            label="상태"
            aria-label="상태"
            value={filters.status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value as CampaignStatus | 'all',
              })
            }
          >
            <SelectOption value="all">전체 상태</SelectOption>
            <SelectOption value="active">운영 중</SelectOption>
            <SelectOption value="paused">일시중지</SelectOption>
            <SelectOption value="ended">종료</SelectOption>
          </Select>
          <Select
            label="채널"
            aria-label="채널"
            value={filters.channel}
            onChange={(event) =>
              updateFilters({
                channel: event.target.value as typeof filters.channel,
              })
            }
          >
            <SelectOption value="all">전체 채널</SelectOption>
            <SelectOption value="google">구글</SelectOption>
            <SelectOption value="meta">메타</SelectOption>
            <SelectOption value="naver">네이버</SelectOption>
            <SelectOption value="kakao">카카오</SelectOption>
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
            label="프리셋 이름"
            aria-label="프리셋 이름"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
            placeholder="프리셋 이름 입력"
          />
          <Select
            label="저장된 프리셋"
            aria-label="저장된 프리셋"
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
          >
            <SelectOption value="">저장된 프리셋 선택</SelectOption>
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
            프리셋 저장
          </Button>
          <Button
            variant="secondary"
            data-testid="load-preset-button"
            onClick={handleLoadPreset}
            disabled={!selectedPresetId}
          >
            불러오기
          </Button>
          <Button
            variant="secondary"
            data-testid="delete-preset-button"
            onClick={() => deletePresetMutation.mutate(selectedPresetId)}
            disabled={!selectedPresetId}
          >
            삭제
          </Button>
          <Button
            variant="secondary"
            data-testid="download-csv-button"
            onClick={handleDownloadCsv}
          >
            CSV 다운로드
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
            초기화
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
            aria-live="polite"
            data-testid="campaign-results-count"
          >
            현재 조건에 맞는 캠페인 {filteredCampaigns.length}개
          </p>
          {canEdit ? (
            <div className="flex items-center gap-3">
              <Select
                label="일괄 변경 상태"
                value={bulkStatus}
                aria-label="일괄 변경 상태"
                onChange={(event) =>
                  setBulkStatus(event.target.value as CampaignStatus)
                }
              >
                <SelectOption value="active">운영 중으로 변경</SelectOption>
                <SelectOption value="paused">일시중지로 변경</SelectOption>
                <SelectOption value="ended">종료로 변경</SelectOption>
              </Select>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={selectedCampaignIds.length === 0}
              >
                일괄 상태 변경
              </Button>
            </div>
          ) : (
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              조회 전용 계정은 데이터를 확인할 수 있지만 상태 변경은 할 수 없습니다.
            </p>
          )}
        </div>
      </section>

      {paginatedCampaigns.length === 0 ? (
        <EmptyState
          title="조건에 맞는 캠페인이 없습니다"
          description="검색어, 채널, 기간 조건을 더 넓혀서 다시 확인해 보세요."
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
          title="캠페인 상태 변경"
          description={`선택한 ${selectedCampaignIds.length}개 캠페인의 상태를 "${campaignStatusTextMap[bulkStatus]}"(으)로 변경할까요?`}
          confirmLabel="변경 적용"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => batchUpdateMutation.mutate(bulkStatus)}
        />
      ) : null}
    </div>
  )
}
