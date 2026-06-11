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
import { StatusBadge } from '../components/ui/StatusBadge'
import { getDashboard } from '../lib/api/mediaops'
import { formatCompactCurrency, formatPercent, formatRatio } from '../lib/format'
import type { Campaign } from '../types/mediaops'
import { useI18n } from '../i18n'

function createTopCampaignColumns(t: (key: string) => string): Array<DataTableColumn<Campaign>> {
  return [
  {
    id: 'name',
    header: t('labels.table.campaign'),
    cell: (campaign) => (
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{campaign.name}</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {t(`labels.channel.${campaign.channel}`)} · {campaign.managerName}
        </p>
      </div>
    ),
  },
  {
    id: 'revenue',
    header: t('labels.table.revenue'),
    cell: (campaign) => formatCompactCurrency(campaign.revenue),
  },
  {
    id: 'spend',
    header: t('labels.table.spend'),
    cell: (campaign) => formatCompactCurrency(campaign.spend),
  },
  {
    id: 'roas',
    header: 'ROAS',
    cell: (campaign) => formatRatio(campaign.roas),
  },
  {
    id: 'conversionRate',
    header: t('labels.table.conversionRate'),
    cell: (campaign) => formatPercent(campaign.conversionRate),
  },
  ]
}

const metricAccentClasses = [
  'bg-[#6d5dfc] text-white',
  'bg-[#20c4d8] text-white',
  'bg-[#22c55e] text-white',
  'bg-[#ef4444] text-white',
] as const

const dashboardMetricLabelKeyMap: Record<string, string> = {
  '총 매출': 'labels.metric.totalRevenue',
  '총 광고비': 'labels.metric.totalSpend',
  '평균 ROAS': 'labels.metric.averageRoas',
  '평균 전환율': 'labels.metric.averageConversionRate',
  '운영 중 캠페인': 'labels.metric.activeCampaigns',
}

function translateDashboardMetricLabel(label: string, t: (key: string) => string) {
  const key = dashboardMetricLabelKeyMap[label]
  return key ? t(key) : label
}

export function DashboardPage() {
  const { t } = useI18n()
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
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  const dashboard = dashboardQuery.data?.dashboard

  if (!dashboard) {
    return <ErrorStatePanel message={t('dashboard.error')} />
  }

  const topCampaignColumns = createTopCampaignColumns(t)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      {dashboard.metrics.length === 0 ? (
        <EmptyState
          title={t('dashboard.emptyTitle')}
          description={t('dashboard.emptyDesc')}
        />
      ) : (
        <>
          <section className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.metrics.slice(0, 4).map((metric, index) => (
              <article
                key={`accent-${metric.id}`}
                className={`relative min-w-0 overflow-hidden rounded-xl p-4 shadow-[0_14px_34px_rgba(15,23,42,0.1)] ${metricAccentClasses[index % metricAccentClasses.length]}`}
              >
                <div className="absolute right-[-14px] top-[-28px] h-24 w-24 rounded-full bg-white/15" />
                <div className="relative min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                    {translateDashboardMetricLabel(metric.label, t)}
                  </p>
                  <p className="numeric-value mt-3 text-[clamp(1.35rem,5vw,1.5rem)] font-semibold tracking-[-0.03em]">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-white/80">{metric.delta}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(280px,0.78fr)]">
            <article className="surface-card min-w-0 overflow-hidden p-4 sm:p-5">
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--panel-muted)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                    {t('dashboard.heroEyebrow')}
                  </div>
                  <h3 className="mt-5 text-[clamp(1.5rem,5vw,1.75rem)] font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)]">
                    {t('dashboard.heroTitle')}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-tertiary)]">
                    {t('dashboard.heroDesc')}
                  </p>

                  <div className="mt-7 grid min-w-0 gap-3 md:grid-cols-3">
                    {dashboard.metrics.slice(0, 3).map((metric) => (
                      <div key={metric.id} className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-3.5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                          {translateDashboardMetricLabel(metric.label, t)}
                        </p>
                        <p className="numeric-value mt-3 text-[clamp(1.25rem,5vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                          {metric.value}
                        </p>
                        <p className="mt-2 text-xs text-[var(--text-tertiary)]">{metric.delta}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                        {t('dashboard.weeklyOverview')}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{t('dashboard.operationFlow')}</p>
                    </div>
                    <span className="w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand)]">
                      {t('dashboard.realtime')}
                    </span>
                  </div>
                  <div className="mt-6 flex h-40 min-w-0 items-end gap-1.5 sm:gap-2">
                    {dashboard.trend.map((point, index) => (
                      <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <span
                          className="w-full rounded-full bg-[var(--brand)]/80"
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

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {dashboard.metrics.slice(3).map((metric) => (
                <MetricCard
                  key={metric.id}
                  label={translateDashboardMetricLabel(metric.label, t)}
                  value={metric.value}
                  delta={metric.delta}
                  tone={metric.tone}
                />
              ))}
            </div>
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)]">
            <ChartCard
              title={t('dashboard.revenueSpendTrend')}
              description={t('dashboard.revenueSpendTrendDesc')}
            >
              <RevenueSpendTrendChart data={dashboard.trend} />
            </ChartCard>
            <ChartCard
              title={t('dashboard.statusDistribution')}
              description={t('dashboard.statusDistributionDesc')}
            >
              <CampaignStatusChart data={dashboard.statusDistribution} />
            </ChartCard>
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)]">
            <ChartCard
              title={t('dashboard.topCampaigns')}
              description={t('dashboard.topCampaignsDesc')}
            >
              <DataTable
                caption={t('dashboard.topCampaignsCaption')}
                columns={topCampaignColumns}
                rows={dashboard.topCampaigns}
                getRowKey={(campaign) => campaign.id}
              />
            </ChartCard>

            <ChartCard
              title={t('dashboard.alerts')}
              description={t('dashboard.alertsDesc')}
            >
              <div className="space-y-3">
                {dashboard.alerts.map((alert) => (
                  <article key={alert.id} className="surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-[var(--text-primary)]">{alert.title}</p>
                      <StatusBadge
                        label={
                          alert.tone === 'warning'
                            ? t('common.warning')
                            : alert.tone === 'positive'
                              ? t('common.healthy')
                              : t('common.info')
                        }
                        tone={
                          alert.tone === 'warning'
                            ? 'warning'
                            : alert.tone === 'positive'
                              ? 'positive'
                              : 'neutral'
                        }
                      />
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
              title={t('dashboard.comparison')}
              description={t('dashboard.comparisonDesc')}
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
