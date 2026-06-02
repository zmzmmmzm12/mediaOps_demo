import { useQuery } from '@tanstack/react-query'
import { ChannelComparisonChart, CampaignStatusChart, RevenueSpendTrendChart } from '../components/charts/RechartsPanels'
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
import type { Campaign } from '../types/mediaops'

const topCampaignColumns: Array<DataTableColumn<Campaign>> = [
  {
    id: 'name',
    header: 'Campaign',
    cell: (campaign) => (
      <div>
        <p className="font-semibold text-slate-950">{campaign.name}</p>
        <p className="text-xs text-slate-500">{campaign.channel} · {campaign.managerName}</p>
      </div>
    ),
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
  {
    id: 'conversionRate',
    header: 'CVR',
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
            Retry
          </Button>
        }
      />
    )
  }

  const dashboard = dashboardQuery.data?.dashboard

  if (!dashboard) {
    return <ErrorStatePanel message="Dashboard data is unavailable." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={dashboard.headline}
        description={dashboard.subheadline}
      />

      {dashboard.metrics.length === 0 ? (
        <EmptyState
          title="No dashboard data yet"
          description="The current filter combination did not return any KPI or chart data."
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-5">
            {dashboard.metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                label={metric.label}
                value={metric.value}
                delta={metric.delta}
                tone={metric.tone}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <ChartCard
              title="Revenue vs ad spend"
              description="Recent trend for top-line revenue and media cost."
            >
              <RevenueSpendTrendChart data={dashboard.trend} />
            </ChartCard>
            <ChartCard
              title="Campaign status distribution"
              description="Active, paused, and ended campaign mix."
            >
              <CampaignStatusChart data={dashboard.statusDistribution} />
            </ChartCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ChartCard
              title="Top 5 campaigns"
              description="Best-performing campaigns ranked by ROAS."
            >
              <DataTable
                columns={topCampaignColumns}
                rows={dashboard.topCampaigns}
                getRowKey={(campaign) => campaign.id}
              />
            </ChartCard>

            <ChartCard
              title="Performance alerts"
              description="Campaigns that need attention first."
            >
              <div className="space-y-3">
                {dashboard.alerts.map((alert) => (
                  <article
                    key={alert.id}
                    className="rounded-3xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-950">{alert.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{alert.detail}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {alert.tone}
                    </p>
                  </article>
                ))}
              </div>
            </ChartCard>
          </section>

          <section>
            <ChartCard
              title="Revenue vs spend by top campaigns"
              description="Quick comparison of current leaders."
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
