import { useQuery } from '@tanstack/react-query'
import { ChannelComparisonChart, RevenueSpendTrendChart, RoasRankingChart } from '../components/charts/RechartsPanels'
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

const rankingColumns: Array<DataTableColumn<Campaign>> = [
  {
    id: 'name',
    header: 'Campaign',
    cell: (campaign) => campaign.name,
  },
  {
    id: 'channel',
    header: 'Channel',
    cell: (campaign) => campaign.channel,
  },
  {
    id: 'revenue',
    header: 'Revenue',
    cell: (campaign) => formatCompactCurrency(campaign.revenue),
  },
  {
    id: 'spend',
    header: 'Spend',
    cell: (campaign) => formatCompactCurrency(campaign.spend),
  },
  {
    id: 'roas',
    header: 'ROAS',
    cell: (campaign) => formatRatio(campaign.roas),
  },
]

export function ReportsPage() {
  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
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
            Retry
          </Button>
        }
      />
    )
  }

  const reports = reportsQuery.data?.reports

  if (!reports) {
    return <ErrorStatePanel message="Reports data is unavailable." />
  }

  if (
    reports.revenueByPeriod.length === 0 &&
    reports.channelRevenueVsSpend.length === 0 &&
    reports.roasRanking.length === 0
  ) {
    return (
      <EmptyState
        title="No reports data"
        description="Try a wider date range or another report source."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Revenue and efficiency reports"
        description="Reusable chart and table patterns for revenue, spend, and ROAS reporting."
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
            Download CSV
          </Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="Revenue by period" description="Recent revenue trend by month.">
          <RevenueSpendTrendChart
            data={reports.revenueByPeriod.map((item) => ({
              date: item.period,
              revenue: item.revenue,
              spend: Math.round(item.revenue * 0.38),
            }))}
          />
        </ChartCard>
        <ChartCard title="Channel revenue vs spend" description="Top-line financial comparison by channel.">
          <ChannelComparisonChart data={reports.channelRevenueVsSpend} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="ROAS ranking" description="Highest-return campaigns first.">
          <RoasRankingChart data={reports.roasRanking} />
        </ChartCard>
        <ChartCard title="Campaign ROAS table" description="Table view paired with the ranking chart.">
          <DataTable
            columns={rankingColumns}
            rows={reports.roasRanking.slice(0, 8)}
            getRowKey={(campaign) => campaign.id}
          />
        </ChartCard>
      </section>
    </div>
  )
}
