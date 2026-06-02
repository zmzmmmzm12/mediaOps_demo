import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
import type {
  CampaignDetailResponse,
  CampaignListResponse,
  CampaignMemoUpdateResponse,
  CampaignStatus,
  CampaignUpdateResponse,
} from '../types/mediaops'

const creativeColumns: Array<DataTableColumn<CampaignDetailResponse['detail']['creatives'][number]>> = [
  {
    id: 'creative',
    header: 'Creative',
    cell: (creative) => (
      <div>
        <p className="font-semibold text-slate-950">{creative.creativeName}</p>
        <p className="text-xs text-slate-500">
          {formatInteger(creative.impressions)} impressions
        </p>
      </div>
    ),
  },
  {
    id: 'spend',
    header: 'Spend',
    cell: (creative) => formatCompactCurrency(creative.spend),
  },
  {
    id: 'revenue',
    header: 'Revenue',
    cell: (creative) => formatCompactCurrency(creative.revenue),
  },
  {
    id: 'roas',
    header: 'ROAS',
    cell: (creative) => formatRatio(creative.roas),
  },
  {
    id: 'conversionRate',
    header: 'CVR',
    cell: (creative) => formatPercent(creative.conversionRate),
  },
]

type MutationContext = {
  previousDetail?: CampaignDetailResponse
  previousList?: CampaignListResponse
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const canEdit = session ? hasPermission(session.role, 'campaigns:edit') : false
  const showToast = useToastStore((state) => state.showToast)
  const [activeTab, setActiveTab] = useState('overview')
  const [memoOverrides, setMemoOverrides] = useState<Record<string, string>>({})

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
        title: 'Campaign status update failed.',
      })
    },
    onSuccess: () => {
      showToast({
        tone: 'success',
        title: 'Campaign status updated.',
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
        title: 'Memo save failed.',
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
            Retry
          </Button>
        }
      />
    )
  }

  if (!detail) {
    return <ErrorStatePanel message="Campaign detail is unavailable." />
  }

  const campaign = detail.campaign
  const memoDraft = memoOverrides[campaign.id] ?? campaign.memo

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/campaigns"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to campaigns
        </Link>
        <StatusBadge label={campaign.status} tone={campaign.status === 'active' ? 'positive' : campaign.status === 'paused' ? 'warning' : 'neutral'} />
        <StatusBadge label={campaign.priority} tone={campaign.priority === 'critical' ? 'warning' : 'neutral'} />
      </div>

      <PageHeader
        eyebrow="Campaign Detail"
        title={campaign.name}
        description={`${campaign.channel} · ${campaign.managerName} · ${campaign.startDate} to ${campaign.endDate}`}
        actions={
          canEdit ? (
            <Select
              label="Campaign status"
              aria-label="Campaign status"
              value={campaign.status}
              onChange={(event) =>
                statusMutation.mutate(event.target.value as CampaignStatus)
              }
              className="border-white/10 bg-white/10 text-white [&>option]:text-slate-900"
            >
              <SelectOption value="active">Active</SelectOption>
              <SelectOption value="paused">Paused</SelectOption>
              <SelectOption value="ended">Ended</SelectOption>
            </Select>
          ) : null
        }
      />

      <section className="grid gap-4 lg:grid-cols-5">
        <MetricCard label="Revenue" value={formatCompactCurrency(campaign.revenue)} delta={`${formatInteger(campaign.conversions)} conversions`} tone="positive" />
        <MetricCard label="Ad spend" value={formatCompactCurrency(campaign.spend)} delta={`${detail.summary.budgetUtilization}% of budget used`} tone="neutral" />
        <MetricCard label="ROAS" value={formatRatio(campaign.roas)} delta={detail.summary.health} tone={campaign.roas >= 2 ? 'positive' : 'warning'} />
        <MetricCard label="Conversion rate" value={formatPercent(campaign.conversionRate)} delta={detail.summary.pacing} tone="positive" />
        <MetricCard label="Budget" value={formatCompactCurrency(campaign.budget)} delta={detail.summary.nextMilestone} tone="neutral" />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'overview', label: 'Overview' },
            { id: 'creatives', label: 'Creatives' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'memo', label: 'Memo' },
          ]}
        />
      </section>

      {activeTab === 'overview' ? (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ChartCard
            title="Performance trend"
            description="Revenue and spend trend by period."
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
            title="Budget utilization"
            description="Current budget burn against the campaign cap."
          >
            <div className="space-y-4">
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-700"
                  style={{ width: `${Math.min(100, detail.summary.budgetUtilization)}%` }}
                />
              </div>
              <p className="text-sm text-slate-500">
                {detail.summary.budgetUtilization}% of the budget is already used.
              </p>
              <div className="space-y-3">
                {detail.activity.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{item.actor}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.timeLabel}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.message}</p>
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
            title="Creative performance"
            description="Material-level breakdown for spend, revenue, ROAS, and conversion rate."
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
            title="Channel comparison"
            description="Revenue versus spend by channel."
          >
            <ChannelComparisonChart data={detail.channelComparison} />
          </ChartCard>
          <ChartCard
            title="Daily revenue summary"
            description="Recent daily financial performance."
          >
            <div className="space-y-3">
              {detail.delivery.map((point) => (
                <div key={point.date} className="grid grid-cols-4 gap-3 rounded-3xl bg-slate-50 px-4 py-4 text-sm">
                  <div>
                    <p className="text-slate-500">Date</p>
                    <p className="font-semibold text-slate-950">{point.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Revenue</p>
                    <p className="font-semibold text-slate-950">{formatCompactCurrency(point.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Spend</p>
                    <p className="font-semibold text-slate-950">{formatCompactCurrency(point.spend)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">ROAS</p>
                    <p className="font-semibold text-slate-950">{formatRatio(point.roas)}</p>
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
            title="Operations memo"
            description="Write and update internal notes with optimistic save."
          >
            <textarea
              aria-label="Operations memo"
              value={memoDraft}
              onChange={(event) =>
                setMemoOverrides((current) => ({
                  ...current,
                  [campaign.id]: event.target.value,
                }))
              }
              disabled={!canEdit}
              rows={8}
              className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm text-slate-700 disabled:bg-slate-100"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500" aria-live="polite">
                {!canEdit
                  ? 'Viewer access cannot edit memo.'
                  : memoMutation.isPending
                    ? 'Saving memo...'
                    : memoMutation.isSuccess
                      ? 'Memo saved.'
                      : memoMutation.isError
                        ? memoMutation.error.message
                        : 'Save notes with optimistic update and rollback support.'}
              </p>
              {canEdit ? (
                <Button
                  onClick={() =>
                    memoMutation.mutate(memoDraft, {
                      onSuccess: () => {
                        showToast({
                          tone: 'success',
                          title: 'Memo saved.',
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
                  Save memo
                </Button>
              ) : null}
            </div>
          </ChartCard>
        </div>
      ) : null}
    </div>
  )
}
