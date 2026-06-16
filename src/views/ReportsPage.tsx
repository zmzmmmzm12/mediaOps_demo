'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ChannelComparisonChart,
  RevenueSpendTrendChart,
  RoasRankingChart,
} from '../components/charts/RechartsPanels'
import { ChartCard } from '../components/charts/ChartCard'
import { DataTable, type DataTableColumn } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorStatePanel } from '../components/ui/ErrorStatePanel'
import { PageHeader } from '../components/ui/PageHeader'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { Button } from '../components/ui/Button'
import { getReports } from '../lib/api/mediaops'
import { buildCampaignCsv } from '../features/campaigns/csv'
import { downloadTextFile } from '../lib/download'
import { formatCompactCurrency, formatRatio } from '../lib/format'
import type { Campaign } from '../types/mediaops'
import { useI18n } from '../i18n'

function createRankingColumns(t: (key: string) => string): Array<DataTableColumn<Campaign>> {
  return [
  {
    id: 'name',
    header: t('labels.table.campaign'),
    cell: (campaign) => (
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{campaign.name}</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {t(`labels.channel.${campaign.channel}`)}
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
  ]
}

export function ReportsPage() {
  const { t } = useI18n()
  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: ({ signal }) => getReports({ signal }),
  })

  if (reportsQuery.isLoading) {
    return <PageSkeleton />
  }

  if (reportsQuery.isError) {
    return (
      <ErrorStatePanel
        message={reportsQuery.error.message}
        action={
          <Button variant="secondary" onClick={() => reportsQuery.refetch()}>
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  const reports = reportsQuery.data?.reports

  if (!reports) {
    return <ErrorStatePanel message={t('reports.emptyDesc')} />
  }

  if (
    reports.revenueByPeriod.length === 0 &&
    reports.channelRevenueVsSpend.length === 0 &&
    reports.roasRanking.length === 0
  ) {
    return (
      <EmptyState
        title={t('reports.emptyTitle')}
        description={t('reports.emptyDesc')}
      />
    )
  }

  const totalRevenue = reports.revenueByPeriod.reduce((sum, item) => sum + item.revenue, 0)
  const topChannel = [...reports.channelRevenueVsSpend].sort((left, right) => right.revenue - left.revenue)[0]
  const topCampaign = reports.roasRanking[0]
  const rankingColumns = createRankingColumns(t)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t('reports.eyebrow')}
        title={t('reports.title')}
        description={t('reports.description')}
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              downloadTextFile(
                'mediaops-reports-roas-ranking.csv',
                buildCampaignCsv(reports.roasRanking),
                'text/csv;charset=utf-8',
              )
            }
          >
            {t('common.downloadCsv')}
          </Button>
        }
      />

      <section className="surface-card min-w-0 overflow-hidden p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">{t('reports.summary')}</p>
            <h3 className="mt-3 text-[clamp(1.35rem,5vw,1.5rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">{t('reports.summaryTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {t('reports.summaryDesc')}
            </p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('reports.totalRevenue')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">{formatCompactCurrency(totalRevenue)}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">{t('reports.periodRevenueTotal')}</p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('reports.topChannel')}</p>
            <p className="mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">
              {topChannel ? t(`labels.channel.${topChannel.channel}`) : '-'}
            </p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              {topChannel ? formatCompactCurrency(topChannel.revenue) : t('reports.noData')}
            </p>
          </div>
          <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{t('reports.topCampaign')}</p>
            <p className="numeric-value mt-3 text-[clamp(1.3rem,5vw,1.5rem)] font-semibold text-[var(--text-primary)]">
              {topCampaign ? formatRatio(topCampaign.roas) : '-'}
            </p>
            <p className="mt-2 truncate text-xs text-[var(--text-tertiary)]">
              {topCampaign ? topCampaign.name : t('reports.noData')}
            </p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-2">
        <ChartCard title={t('reports.revenueTrend')} description={t('reports.revenueTrendDesc')}>
          <RevenueSpendTrendChart
            data={reports.revenueByPeriod.map((item) => ({
              date: item.period,
              revenue: item.revenue,
              spend: Math.round(item.revenue * 0.38),
            }))}
          />
        </ChartCard>
        <ChartCard title={t('reports.channelSpend')} description={t('reports.channelSpendDesc')}>
          <ChannelComparisonChart data={reports.channelRevenueVsSpend} />
        </ChartCard>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)]">
        <ChartCard title={t('reports.roasRank')} description={t('reports.roasRankDesc')}>
          <RoasRankingChart data={reports.roasRanking} />
        </ChartCard>
        <ChartCard title={t('reports.roasTable')} description={t('reports.roasTableDesc')}>
          <DataTable
            caption="ROAS 순위 캠페인 표"
            columns={rankingColumns}
            rows={reports.roasRanking.slice(0, 8)}
            getRowKey={(campaign) => campaign.id}
          />
        </ChartCard>
      </section>
    </div>
  )
}
