'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ChannelComparisonChart,
  CampaignStatusChart,
  RevenueSpendTrendChart,
} from '../components/charts/RechartsPanels'
import { ChartCard } from '../components/charts/ChartCard'
import { MetricCard } from '../components/dashboard/MetricCard'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { getDashboard } from '../lib/api/mediaops'
import { formatCompactCurrency, formatPercent, formatRatio } from '../lib/format'
import { campaignChannelTextMap } from '../lib/labels'
import type { Campaign } from '../types/mediaops'

const topCampaignColumns: Array<DataTableColumn<Campaign>> = [
  {
    id: 'name',
    header: '캠페인',
    cell: (campaign) => (
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{campaign.name}</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {campaignChannelTextMap[campaign.channel]} · {campaign.managerName}
        </p>
      </div>
    ),
  },
  {
    id: 'revenue',
    header: '매출',
    cell: (campaign) => formatCompactCurrency(campaign.revenue),
  },
  {
    id: 'spend',
    header: '광고비',
    cell: (campaign) => formatCompactCurrency(campaign.spend),
  },
  {
    id: 'roas',
    header: 'ROAS',
    cell: (campaign) => formatRatio(campaign.roas),
  },
  {
    id: 'conversionRate',
    header: '전환율',
    cell: (campaign) => formatPercent(campaign.conversionRate),
  },
]

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  if (dashboardQuery.isLoading) {
    return <PageSkeleton />
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorStatePanel
        message={dashboardQuery.error.message}
        action={
          <Button variant="secondary" onClick={() => dashboardQuery.refetch()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  const dashboard = dashboardQuery.data?.dashboard

  if (!dashboard) {
    return <ErrorStatePanel message="대시보드 데이터를 표시할 수 없습니다." />
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="대시보드"
        title={dashboard.headline}
        description={dashboard.subheadline}
      />

      {dashboard.metrics.length === 0 ? (
        <EmptyState
          title="표시할 대시보드 데이터가 없습니다"
          description="현재 조건에서는 KPI나 차트 데이터를 불러오지 못했습니다."
        />
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(300px,0.78fr)]">
            <article className="surface-card overflow-hidden p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--panel-muted)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                    운영 대시보드
                  </div>
                  <h3 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)]">
                    운영 팀이 바로 확인해야 할
                    <br />
                    핵심 성과 요약
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-tertiary)]">
                    매출, 광고비, 상태 분포, 상위 캠페인 성과를 관리자형 화면 밀도로 정리했습니다.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {dashboard.metrics.slice(0, 3).map((metric) => (
                      <div key={metric.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-3.5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                          {metric.value}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-tertiary)]">{metric.delta}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                        주간 개요
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">운영 흐름</p>
                    </div>
                    <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand)]">
                      실시간
                    </span>
                  </div>
                  <div className="mt-6 flex h-40 items-end gap-2">
                    {dashboard.trend.map((point, index) => (
                      <div key={point.date} className="flex w-full flex-col items-center gap-2">
                        <span
                      className="w-full rounded-full bg-indigo-400/80"
                          style={{ height: `${38 + ((point.revenue + index * 17) % 58)}%` }}
                        />
                        <span className="text-[10px] text-[var(--text-quaternary)]">
                          {point.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {dashboard.metrics.slice(3).map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  delta={metric.delta}
                  tone={metric.tone}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <MetricCard
                key={`summary-${metric.id}`}
                label={metric.label}
                value={metric.value}
                delta={metric.delta}
                tone={metric.tone}
              />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
            <ChartCard
              title="매출 대비 광고비 추이"
              description="최근 기간의 매출과 광고비 흐름을 확인합니다."
            >
              <RevenueSpendTrendChart data={dashboard.trend} />
            </ChartCard>
            <ChartCard
              title="캠페인 상태 분포"
              description="운영 중, 일시중지, 종료 상태의 비중입니다."
            >
              <CampaignStatusChart data={dashboard.statusDistribution} />
            </ChartCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
            <ChartCard
              title="성과 상위 캠페인"
              description="ROAS 기준으로 상위 캠페인을 빠르게 비교합니다."
            >
              <DataTable
                caption="성과 상위 캠페인 표"
                columns={topCampaignColumns}
                rows={dashboard.topCampaigns}
                getRowKey={(campaign) => campaign.id}
              />
            </ChartCard>

            <ChartCard
              title="운영 알림"
              description="우선 확인이 필요한 캠페인을 정리했습니다."
            >
              <div className="space-y-3">
                {dashboard.alerts.map((alert) => (
                  <article key={alert.id} className="surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[var(--text-primary)]">{alert.title}</p>
                      <span className="rounded-full bg-[var(--panel-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-tertiary)] ring-1 ring-inset ring-[var(--border-subtle)]">
                        {alert.tone === 'warning'
                          ? '주의'
                          : alert.tone === 'positive'
                            ? '양호'
                            : '참고'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-tertiary)]">
                      {alert.detail}
                    </p>
                  </article>
                ))}
              </div>
            </ChartCard>
          </section>

          <section>
            <ChartCard
              title="상위 캠페인 매출/광고비 비교"
              description="주요 캠페인의 현재 성과를 빠르게 비교합니다."
            >
              <ChannelComparisonChart
                data={dashboard.topCampaigns.map((campaign) => ({
                  channel: campaign.name,
                  revenue: campaign.revenue,
                  spend: campaign.spend,
                }))}
              />
            </ChartCard>
          </section>
        </>
      )}
    </div>
  )
}
