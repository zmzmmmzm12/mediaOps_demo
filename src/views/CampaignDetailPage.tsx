'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChannelComparisonChart,
  RevenueSpendTrendChart,
} from '../components/charts/RechartsPanels'
import { ChartCard } from '../components/charts/ChartCard'
import { Button } from '../components/ui/Button'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { MetricCard } from '../components/dashboard/MetricCard'
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
} from '../lib/labels'
import type {
  CampaignDetailResponse,
  CampaignListResponse,
  CampaignMemoUpdateResponse,
  CampaignStatus,
  CampaignUpdateResponse,
} from '../types/mediaops'
import { useI18n } from '../i18n'

type MutationContext = {
  previousDetail?: CampaignDetailResponse
  previousList?: CampaignListResponse
}

interface CampaignDetailPageProps {
  campaignId: string
}

export function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const canEdit = session ? hasPermission(session.role, 'campaigns:edit') : false
  const theme = usePreferencesStore((state) => state.theme)
  const showToast = useToastStore((state) => state.showToast)
  const [activeTab, setActiveTab] = useState('overview')
  const [memoOverrides, setMemoOverrides] = useState<Record<string, string>>({})

  const creativeColumns: Array<
    DataTableColumn<CampaignDetailResponse['detail']['creatives'][number]>
  > = useMemo(
    () => [
      {
        id: 'creative',
        header: t('labels.table.creative'),
        cell: (creative) => (
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{creative.creativeName}</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {t('labels.table.impressions')} {formatInteger(creative.impressions)}
            </p>
          </div>
        ),
      },
      {
        id: 'spend',
        header: t('labels.table.spend'),
        cell: (creative) => formatCompactCurrency(creative.spend),
      },
      {
        id: 'revenue',
        header: t('labels.table.revenue'),
        cell: (creative) => formatCompactCurrency(creative.revenue),
      },
      {
        id: 'roas',
        header: 'ROAS',
        cell: (creative) => formatRatio(creative.roas),
      },
      {
        id: 'conversionRate',
        header: t('labels.table.conversionRate'),
        cell: (creative) => formatPercent(creative.conversionRate),
      },
    ],
    [t],
  )

  const detailQuery = useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: () => getCampaignDetail(campaignId),
    enabled: Boolean(campaignId),
  })

  const statusMutation = useMutation<
    CampaignUpdateResponse,
    Error,
    CampaignStatus,
    MutationContext
  >({
    mutationFn: (status) => updateCampaign(campaignId, { status }),
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
    mutationFn: (memo) => updateCampaignMemo(campaignId, { memo }),
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
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  if (!detail) {
    return <ErrorStatePanel message={t('detail.eyebrow')} />
  }

  const campaign = detail.campaign
  const memoDraft = memoOverrides[campaign.id] ?? campaign.memo

  return (
    <div className="space-y-5">
      <section className="surface-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Link
              href="/campaigns"
              className="focus-ring inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--panel-subtle)]"
            >
              {t('detail.back')}
            </Link>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              {t('detail.eyebrow')}
            </p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)]">{campaign.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {campaignChannelTextMap[campaign.channel]} · {campaign.managerName} · {campaign.startDate} ~ {campaign.endDate}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={t(`labels.status.${campaign.status}`)}
                tone={campaign.status === 'active' ? 'positive' : campaign.status === 'paused' ? 'warning' : 'neutral'}
              />
              <StatusBadge
                label={t(`labels.priority.${campaign.priority}`)}
                tone={campaign.priority === 'critical' ? 'warning' : 'neutral'}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('detail.budgetUsage')}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{detail.summary.budgetUtilization}%</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">{detail.summary.pacing}</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('detail.statusChange')}</p>
              {canEdit ? (
                <Select
                  label={undefined}
                  aria-label={t('detail.statusChange')}
                  value={campaign.status}
                  onChange={(event) =>
                    statusMutation.mutate(event.target.value as CampaignStatus)
                  }
                  className="mt-2 min-w-40"
                >
                  <SelectOption value="active">{t('labels.status.active')}</SelectOption>
                  <SelectOption value="paused">{t('labels.status.paused')}</SelectOption>
                  <SelectOption value="ended">{t('labels.status.ended')}</SelectOption>
                </Select>
              ) : (
                <p className="mt-2 text-sm text-[var(--text-tertiary)]">{t('detail.readonly')}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label={t('detail.revenue')} value={formatCompactCurrency(campaign.revenue)} delta={`전환 ${formatInteger(campaign.conversions)}건`} tone="positive" />
        <MetricCard label={t('labels.table.spend')} value={formatCompactCurrency(campaign.spend)} delta={`${t('detail.budgetUsage')} ${detail.summary.budgetUtilization}%`} tone="neutral" />
        <MetricCard label="ROAS" value={formatRatio(campaign.roas)} delta={detail.summary.health} tone={campaign.roas >= 2 ? 'positive' : 'warning'} />
        <MetricCard label={t('labels.table.conversionRate')} value={formatPercent(campaign.conversionRate)} delta={detail.summary.pacing} tone="positive" />
        <MetricCard label={t('labels.table.budget')} value={formatCompactCurrency(campaign.budget)} delta={detail.summary.nextMilestone} tone="neutral" />
      </section>

      <section className="surface-card px-3 py-3">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { id: 'overview', label: t('detail.overview') },
            { id: 'creatives', label: t('detail.creatives') },
            { id: 'revenue', label: t('detail.revenue') },
            { id: 'memo', label: t('detail.memo') },
          ]}
        />
      </section>

      {activeTab === 'overview' ? (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <ChartCard title={t('detail.performanceTrend')} description={t('detail.performanceTrendDesc')}>
            <RevenueSpendTrendChart
              data={detail.delivery.map((point) => ({
                date: point.date,
                revenue: point.revenue,
                spend: point.spend,
              }))}
            />
          </ChartCard>
          <ChartCard title={t('detail.budgetPacing')} description={t('detail.budgetPacingDesc')}>
            <div className="space-y-4">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${Math.min(100, detail.summary.budgetUtilization)}%` }}
                />
              </div>
              <p className="text-sm text-[var(--text-tertiary)]">
                {t('detail.budgetUsageSentence', { value: detail.summary.budgetUtilization })}
              </p>
              <div className="space-y-3">
                {detail.activity.map((item) => (
                  <article key={item.id} className="surface-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[var(--text-primary)]">{item.actor}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-quaternary)]">{item.timeLabel}</p>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-tertiary)]">{item.message}</p>
                  </article>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'creatives' ? (
        <div id="panel-creatives" role="tabpanel" aria-labelledby="tab-creatives" className="space-y-5">
          <ChartCard
            title={t('detail.creativePerformance')}
            description={t('detail.creativePerformanceDesc')}
          >
            <DataTable
              caption="소재 성과 표"
              columns={creativeColumns}
              rows={detail.creatives}
              getRowKey={(creative) => creative.id}
            />
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'revenue' ? (
        <div id="panel-revenue" role="tabpanel" aria-labelledby="tab-revenue" className="grid gap-5 xl:grid-cols-2">
          <ChartCard title={t('detail.channelComparison')} description={t('detail.channelComparisonDesc')}>
            <ChannelComparisonChart data={detail.channelComparison} />
          </ChartCard>
          <ChartCard title={t('detail.dailySummary')} description={t('detail.dailySummaryDesc')}>
            <div className="space-y-3">
              {detail.delivery.map((point) => (
                <div key={point.date} className="surface-muted grid gap-3 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">{t('labels.table.date')}</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{point.date}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">{t('labels.table.revenue')}</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCompactCurrency(point.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">{t('labels.table.spend')}</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCompactCurrency(point.spend)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">ROAS</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatRatio(point.roas)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      ) : null}

      {activeTab === 'memo' ? (
        <div id="panel-memo" role="tabpanel" aria-labelledby="tab-memo" className="space-y-5">
          <ChartCard
            title={t('detail.memoTitle')}
            description={t('detail.memoDesc')}
          >
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
              <textarea
                aria-label={t('detail.memoTitle')}
                value={memoDraft}
                onChange={(event) =>
                  setMemoOverrides((current) => ({
                    ...current,
                    [campaign.id]: event.target.value,
                  }))
                }
                disabled={!canEdit}
                rows={8}
                className={`field-shell focus-ring w-full resize-y border-0 bg-transparent px-0 py-0 text-sm shadow-none ${
                  theme === 'dark' ? 'text-slate-100' : ''
                }`}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--text-tertiary)]" aria-live="polite">
                {!canEdit
                  ? t('detail.memoReadonly')
                  : memoMutation.isPending
                    ? t('detail.memoSaving')
                    : memoMutation.isSuccess
                      ? t('detail.memoSaved')
                      : memoMutation.isError
                        ? memoMutation.error.message
                        : t('detail.memoIdle')}
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
                  {t('detail.saveMemo')}
                </Button>
              ) : null}
            </div>
          </ChartCard>
        </div>
      ) : null}
    </div>
  )
}
