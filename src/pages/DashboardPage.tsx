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
import { usePreferencesStore } from '../features/ui/preferences-store'
import { getDashboard } from '../lib/api/mediaops'
import { formatCompactCurrency, formatPercent, formatRatio } from '../lib/format'
import { campaignChannelTextMap } from '../lib/labels'
import type { Campaign } from '../types/mediaops'

export function DashboardPage() {
  const theme = usePreferencesStore((state) => state.theme)
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const topCampaignColumns: Array<DataTableColumn<Campaign>> = [
    {
      id: 'name',
      header: '캠페인',
      cell: (campaign) => (
        <div>
          <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{campaign.name}</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{campaignChannelTextMap[campaign.channel]} · {campaign.managerName}</p>
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
    <div className="space-y-6">
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

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ChartCard
              title="성과 상위 5개 캠페인"
              description="ROAS 기준으로 가장 좋은 성과를 낸 캠페인입니다."
            >
              <DataTable
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
                  <article
                    key={alert.id}
                    className={`rounded-3xl border p-4 ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-800/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{alert.title}</p>
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{alert.detail}</p>
                    <p className={`mt-3 text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {alert.tone === 'warning' ? '주의 필요' : alert.tone === 'positive' ? '양호' : '참고'}
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
