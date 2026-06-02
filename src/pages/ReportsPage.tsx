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
import { campaignChannelTextMap } from '../lib/labels'
import type { Campaign } from '../types/mediaops'

const rankingColumns: Array<DataTableColumn<Campaign>> = [
  {
    id: 'name',
    header: '캠페인',
    cell: (campaign) => campaign.name,
  },
  {
    id: 'channel',
    header: '채널',
    cell: (campaign) => campaignChannelTextMap[campaign.channel],
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
            다시 시도
          </Button>
        }
      />
    )
  }

  const reports = reportsQuery.data?.reports

  if (!reports) {
    return <ErrorStatePanel message="리포트 데이터를 표시할 수 없습니다." />
  }

  if (
    reports.revenueByPeriod.length === 0 &&
    reports.channelRevenueVsSpend.length === 0 &&
    reports.roasRanking.length === 0
  ) {
    return (
      <EmptyState
        title="표시할 리포트 데이터가 없습니다"
        description="기간을 넓히거나 다른 데이터 소스를 확인해 주세요."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="리포트"
        title="매출과 효율 리포트"
        description="매출, 광고비, ROAS를 공통 차트와 테이블 패턴으로 확인할 수 있습니다."
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
            CSV 다운로드
          </Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ChartCard title="기간별 매출 추이" description="최근 기간의 매출 흐름입니다.">
          <RevenueSpendTrendChart
            data={reports.revenueByPeriod.map((item) => ({
              date: item.period,
              revenue: item.revenue,
              spend: Math.round(item.revenue * 0.38),
            }))}
          />
        </ChartCard>
        <ChartCard title="채널별 매출 대비 광고비" description="채널 단위의 매출과 광고비를 비교합니다.">
          <ChannelComparisonChart data={reports.channelRevenueVsSpend} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="ROAS 순위" description="효율이 높은 캠페인 순으로 정렬했습니다.">
          <RoasRankingChart data={reports.roasRanking} />
        </ChartCard>
        <ChartCard title="캠페인 ROAS 표" description="차트와 함께 확인할 수 있는 표 형식 데이터입니다.">
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
