import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChannelComparisonChart, RevenueSpendTrendChart } from '../components/charts/RechartsPanels'
import { ChartCard } from '../components/charts/ChartCard'
import { Button } from '../components/ui/Button'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { MetricCard } from '../components/dashboard/MetricCard'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { Select, SelectOption } from '../components/ui/Select'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Tabs } from '../components/ui/Tabs'
import { useAuthStore } from '../features/auth/auth-store'
import { hasPermission } from '../features/auth/permissions'
import { deriveCampaignSummary } from '../features/campaigns/summary'
import { usePreferencesStore } from '../features/ui/preferences-store'
import { useToastStore } from '../features/ui/toast-store'
import {
  getCampaignDetail,
  updateCampaign,
  updateCampaignMemo,
} from '../lib/api/mediaops'
import {
  formatCompactCurrency,
  formatInteger,
  formatPercent,
  formatRatio,
} from '../lib/format'
import {
  campaignChannelTextMap,
  campaignStatusTextMap,
  priorityTextMap,
} from '../lib/labels'
import type {
  CampaignDetailResponse,
  CampaignListResponse,
  CampaignMemoUpdateResponse,
  CampaignStatus,
  CampaignUpdateResponse,
} from '../types/mediaops'

type MutationContext = {
  previousDetail?: CampaignDetailResponse
  previousList?: CampaignListResponse
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const canEdit = session ? hasPermission(session.role, 'campaigns:edit') : false
  const theme = usePreferencesStore((state) => state.theme)
  const showToast = useToastStore((state) => state.showToast)
  const [activeTab, setActiveTab] = useState('overview')
  const [memoOverrides, setMemoOverrides] = useState<Record<string, string>>({})

  const creativeColumns: Array<DataTableColumn<CampaignDetailResponse['detail']['creatives'][number]>> = useMemo(
    () => [
      {
        id: 'creative',
        header: '소재',
        cell: (creative) => (
          <div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{creative.creativeName}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              노출수 {formatInteger(creative.impressions)}
            </p>
          </div>
        ),
      },
      {
        id: 'spend',
        header: '광고비',
        cell: (creative) => formatCompactCurrency(creative.spend),
      },
      {
        id: 'revenue',
        header: '매출',
        cell: (creative) => formatCompactCurrency(creative.revenue),
      },
      {
        id: 'roas',
        header: 'ROAS',
        cell: (creative) => formatRatio(creative.roas),
      },
      {
        id: 'conversionRate',
        header: '전환율',
        cell: (creative) => formatPercent(creative.conversionRate),
      },
    ],
    [theme],
  )

  const detailQuery = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: () => getCampaignDetail(campaignId ?? ''),
    enabled: Boolean(campaignId),
  })

  const statusMutation = useMutation<
    CampaignUpdateResponse,
    Error,
    CampaignStatus,
    MutationContext
  >({
    mutationFn: (status) => updateCampaign(campaignId ?? '', { status }),
    onMutate: async (status) => {
      const previousDetail = queryClient.getQueryData<CampaignDetailResponse>([
        'campaign-detail',
        campaignId,
      ])
      const previousList = queryClient.getQueryData<CampaignListResponse>(['campaigns'])

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['campaign-detail', campaignId] }),
        queryClient.cancelQueries({ queryKey: ['campaigns'] }),
      ])

      queryClient.setQueryData<CampaignDetailResponse>(
        ['campaign-detail', campaignId],
        (current) =>
          current
            ? {
                detail: {
                  ...current.detail,
                  campaign: {
                    ...current.detail.campaign,
                    status,
                  },
                  summary: deriveCampaignSummary({
                    ...current.detail.campaign,
                    status,
                  }),
                },
              }
            : current,
      )

      queryClient.setQueryData<CampaignListResponse>(['campaigns'], (current) =>
        current
          ? {
              ...current,
              campaigns: current.campaigns.map((campaign) =>
                campaign.id === campaignId ? { ...campaign, status } : campaign,
              ),
            }
          : current,
      )

      return { previousDetail, previousList }
    },
    onError: (_error, _status, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['campaign-detail', campaignId], context.previousDetail)
      }
      if (context?.previousList) {
        queryClient.setQueryData(['campaigns'], context.previousList)
      }
      showToast({
        tone: 'error',
        title: '캠페인 상태 변경에 실패했습니다.',
      })
    },
    onSuccess: () => {
      showToast({
        tone: 'success',
        title: '캠페인 상태를 변경했습니다.',
      })
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaign-detail', campaignId] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
      ])
    },
  })

  const memoMutation = useMutation<
    CampaignMemoUpdateResponse,
    Error,
    string,
    MutationContext
  >({
    mutationFn: (memo) => updateCampaignMemo(campaignId ?? '', { memo }),
    onMutate: async (memo) => {
      const previousDetail = queryClient.getQueryData<CampaignDetailResponse>([
        'campaign-detail',
        campaignId,
      ])
      const previousList = queryClient.getQueryData<CampaignListResponse>(['campaigns'])

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['campaign-detail', campaignId] }),
        queryClient.cancelQueries({ queryKey: ['campaigns'] }),
      ])

      queryClient.setQueryData<CampaignDetailResponse>(
        ['campaign-detail', campaignId],
        (current) =>
          current
            ? {
                detail: {
                  ...current.detail,
                  campaign: {
                    ...current.detail.campaign,
                    memo,
                  },
                },
              }
            : current,
      )

      queryClient.setQueryData<CampaignListResponse>(['campaigns'], (current) =>
        current
          ? {
              ...current,
              campaigns: current.campaigns.map((campaign) =>
                campaign.id === campaignId ? { ...campaign, memo } : campaign,
              ),
            }
          : current,
      )

      return { previousDetail, previousList }
    },
    onError: (_error, _memo, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['campaign-detail', campaignId], context.previousDetail)
      }
      if (context?.previousList) {
        queryClient.setQueryData(['campaigns'], context.previousList)
      }
      showToast({
        tone: 'error',
        title: '메모 저장에 실패했습니다.',
      })
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['campaign-detail', campaignId] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
      ])
    },
  })

  const detail = detailQuery.data?.detail

  if (detailQuery.isLoading) {
    return <PageSkeleton />
  }

  if (detailQuery.isError) {
    return (
      <ErrorStatePanel
        message={detailQuery.error.message}
        action={
          <Button variant="secondary" onClick={() => detailQuery.refetch()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  if (!detail) {
    return <ErrorStatePanel message="캠페인 상세 데이터를 표시할 수 없습니다." />
  }

  const campaign = detail.campaign
  const memoDraft = memoOverrides[campaign.id] ?? campaign.memo

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/campaigns"
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-slate-200'
              : 'border-slate-200 text-slate-700'
          }`}
        >
          캠페인 목록으로
        </Link>
        <StatusBadge label={campaignStatusTextMap[campaign.status]} tone={campaign.status === 'active' ? 'positive' : campaign.status === 'paused' ? 'warning' : 'neutral'} />
        <StatusBadge label={priorityTextMap[campaign.priority]} tone={campaign.priority === 'critical' ? 'warning' : 'neutral'} />
      </div>

      <PageHeader
        eyebrow="캠페인 상세"
        title={campaign.name}
        description={`${campaignChannelTextMap[campaign.channel]} · ${campaign.managerName} · ${campaign.startDate} ~ ${campaign.endDate}`}
        actions={
          canEdit ? (
            <Select
              label="캠페인 상태"
              aria-label="캠페인 상태"
              value={campaign.status}
              onChange={(event) =>
                statusMutation.mutate(event.target.value as CampaignStatus)
              }
              className="min-w-40"
            >
              <SelectOption value="active">운영 중</SelectOption>
              <SelectOption value="paused">일시중지</SelectOption>
              <SelectOption value="ended">종료</SelectOption>
            </Select>
          ) : null
        }
      />

      <section className="grid gap-4 lg:grid-cols-5">
        <MetricCard label="매출" value={formatCompactCurrency(campaign.revenue)} delta={`전환 ${formatInteger(campaign.conversions)}건`} tone="positive" />
        <MetricCard label="광고비" value={formatCompactCurrency(campaign.spend)} delta={`예산 사용률 ${detail.summary.budgetUtilization}%`} tone="neutral" />
        <MetricCard label="ROAS" value={formatRatio(campaign.roas)} delta={detail.summary.health} tone={campaign.roas >= 2 ? 'positive' : 'warning'} />
        <MetricCard label="전환율" value={formatPercent(campaign.conversionRate)} delta={detail.summary.pacing} tone="positive" />
        <MetricCard label="예산" value={formatCompactCurrency(campaign.budget)} delta={detail.summary.nextMilestone} tone="neutral" />
      </section>

      <section
        className={`rounded-[28px] border p-5 ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}
      >
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'overview', label: '개요' },
            { id: 'creatives', label: '소재' },
            { id: 'revenue', label: '매출' },
            { id: 'memo', label: '메모' },
          ]}
        />
      </section>

      {activeTab === 'overview' ? (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ChartCard
            title="성과 추이"
            description="기간별 매출과 광고비 흐름입니다."
          >
            <RevenueSpendTrendChart
              data={detail.delivery.map((point) => ({
                date: point.date,
                revenue: point.revenue,
                spend: point.spend,
              }))}
            />
          </ChartCard>
          <ChartCard
            title="예산 소진율"
            description="설정된 예산 대비 현재 사용량입니다."
          >
            <div className="space-y-4">
              <div className={`h-4 overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${Math.min(100, detail.summary.budgetUtilization)}%` }}
                />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                전체 예산의 {detail.summary.budgetUtilization}%를 사용했습니다.
              </p>
              <div className="space-y-3">
                {detail.activity.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-3xl border p-4 ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-800/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{item.actor}</p>
                      <p className={`text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.timeLabel}</p>
                    </div>
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.message}</p>
                  </article>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'creatives' ? (
        <div id="panel-creatives" role="tabpanel" aria-labelledby="tab-creatives" className="space-y-6">
          <ChartCard
            title="소재 성과"
            description="소재 단위의 광고비, 매출, ROAS, 전환율을 비교합니다."
          >
            <DataTable
              columns={creativeColumns}
              rows={detail.creatives}
              getRowKey={(creative) => creative.id}
            />
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'revenue' ? (
        <div id="panel-revenue" role="tabpanel" aria-labelledby="tab-revenue" className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ChartCard
            title="채널별 비교"
            description="채널별 매출과 광고비를 비교합니다."
          >
            <ChannelComparisonChart data={detail.channelComparison} />
          </ChartCard>
          <ChartCard
            title="일별 성과 요약"
            description="최근 일자별 재무 성과를 확인합니다."
          >
            <div className="space-y-3">
              {detail.delivery.map((point) => (
                <div
                  key={point.date}
                  className={`grid grid-cols-4 gap-3 rounded-3xl px-4 py-4 text-sm ${
                    theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-slate-500">일자</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{point.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">매출</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{formatCompactCurrency(point.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">광고비</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{formatCompactCurrency(point.spend)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">ROAS</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{formatRatio(point.roas)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'memo' ? (
        <div id="panel-memo" role="tabpanel" aria-labelledby="tab-memo" className="space-y-6">
          <ChartCard
            title="운영 메모"
            description="내부 메모를 작성하고 optimistic update로 즉시 반영합니다."
          >
            <textarea
              aria-label="운영 메모"
              value={memoDraft}
              onChange={(event) =>
                setMemoOverrides((current) => ({
                  ...current,
                  [campaign.id]: event.target.value,
                }))
              }
              disabled={!canEdit}
              rows={8}
              className={`w-full rounded-3xl border px-4 py-4 text-sm ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800 text-slate-100 disabled:bg-slate-800 disabled:text-slate-500'
                  : 'border-slate-200 text-slate-700 disabled:bg-slate-100'
              }`}
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} aria-live="polite">
                {!canEdit
                  ? '조회 전용 계정은 메모를 수정할 수 없습니다.'
                  : memoMutation.isPending
                    ? '메모 저장 중...'
                    : memoMutation.isSuccess
                      ? '메모가 저장되었습니다.'
                      : memoMutation.isError
                        ? memoMutation.error.message
                        : '즉시 반영 후 실패 시 롤백되는 방식으로 저장됩니다.'}
              </p>
              {canEdit ? (
                <Button
                  onClick={() =>
                    memoMutation.mutate(memoDraft, {
                      onSuccess: () => {
                        showToast({
                          tone: 'success',
                          title: '메모를 저장했습니다.',
                        })
                        setMemoOverrides((current) => {
                          const next = { ...current }
                          delete next[campaign.id]
                          return next
                        })
                      },
                    })
                  }
                >
                  메모 저장
                </Button>
              ) : null}
            </div>
          </ChartCard>
        </div>
      ) : null}
    </div>
  )
}
