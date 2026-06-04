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

interface CampaignDetailPageProps {
  campaignId: string
}

export function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
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
        header: '소재',
        cell: (creative) => (
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{creative.creativeName}</p>
            <p className="text-xs text-[var(--text-tertiary)]">
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
    [],
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
    <div className="space-y-5">
      <section className="surface-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Link
              href="/campaigns"
              className="focus-ring inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--panel-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--panel-subtle)]"
            >
              캠페인 목록으로
            </Link>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              캠페인 상세
            </p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)]">{campaign.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {campaignChannelTextMap[campaign.channel]} · {campaign.managerName} · {campaign.startDate} ~ {campaign.endDate}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                label={campaignStatusTextMap[campaign.status]}
                tone={campaign.status === 'active' ? 'positive' : campaign.status === 'paused' ? 'warning' : 'neutral'}
              />
              <StatusBadge
                label={priorityTextMap[campaign.priority]}
                tone={campaign.priority === 'critical' ? 'warning' : 'neutral'}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">예산 사용률</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{detail.summary.budgetUtilization}%</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">{detail.summary.pacing}</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">상태 변경</p>
              {canEdit ? (
                <Select
                  label={undefined}
                  aria-label="캠페인 상태"
                  value={campaign.status}
                  onChange={(event) =>
                    statusMutation.mutate(event.target.value as CampaignStatus)
                  }
                  className="mt-2 min-w-40"
                >
                  <SelectOption value="active">운영 중</SelectOption>
                  <SelectOption value="paused">일시중지</SelectOption>
                  <SelectOption value="ended">종료</SelectOption>
                </Select>
              ) : (
                <p className="mt-2 text-sm text-[var(--text-tertiary)]">조회 전용 계정</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="매출" value={formatCompactCurrency(campaign.revenue)} delta={`전환 ${formatInteger(campaign.conversions)}건`} tone="positive" />
        <MetricCard label="광고비" value={formatCompactCurrency(campaign.spend)} delta={`예산 사용률 ${detail.summary.budgetUtilization}%`} tone="neutral" />
        <MetricCard label="ROAS" value={formatRatio(campaign.roas)} delta={detail.summary.health} tone={campaign.roas >= 2 ? 'positive' : 'warning'} />
        <MetricCard label="전환율" value={formatPercent(campaign.conversionRate)} delta={detail.summary.pacing} tone="positive" />
        <MetricCard label="예산" value={formatCompactCurrency(campaign.budget)} delta={detail.summary.nextMilestone} tone="neutral" />
      </section>

      <section className="surface-card px-3 py-3">
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
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <ChartCard title="성과 추이" description="기간별 매출과 광고비 흐름입니다.">
            <RevenueSpendTrendChart
              data={detail.delivery.map((point) => ({
                date: point.date,
                revenue: point.revenue,
                spend: point.spend,
              }))}
            />
          </ChartCard>
          <ChartCard title="예산 소진율" description="설정된 예산 대비 현재 사용량입니다.">
            <div className="space-y-4">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--brand)]"
                  style={{ width: `${Math.min(100, detail.summary.budgetUtilization)}%` }}
                />
              </div>
              <p className="text-sm text-[var(--text-tertiary)]">
                전체 예산의 {detail.summary.budgetUtilization}%를 사용했습니다.
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
            title="소재 성과"
            description="소재 단위의 광고비, 매출, ROAS, 전환율을 비교합니다."
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
          <ChartCard title="채널별 비교" description="채널별 매출과 광고비를 비교합니다.">
            <ChannelComparisonChart data={detail.channelComparison} />
          </ChartCard>
          <ChartCard title="일별 성과 요약" description="최근 일자별 재무 성과를 확인합니다.">
            <div className="space-y-3">
              {detail.delivery.map((point) => (
                <div key={point.date} className="surface-muted grid gap-3 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">일자</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{point.date}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">매출</p>
                    <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatCompactCurrency(point.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-quaternary)]">광고비</p>
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
            title="운영 메모"
            description="메모는 optimistic update로 즉시 반영되고, 실패 시 롤백됩니다."
          >
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
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
                className={`field-shell focus-ring w-full resize-y border-0 bg-transparent px-0 py-0 text-sm shadow-none ${
                  theme === 'dark' ? 'text-slate-100' : ''
                }`}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--text-tertiary)]" aria-live="polite">
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
