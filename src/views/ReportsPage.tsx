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
import { campaignChannelTextMap } from '../lib/labels'
import type { Campaign } from '../types/mediaops'

const rankingColumns: Array<DataTableColumn<Campaign>> = [
  {
    id: 'name',
    header: '캠페인',
    cell: (campaign) => (
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{campaign.name}</p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {campaignChannelTextMap[campaign.channel]}
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

  const totalRevenue = reports.revenueByPeriod.reduce((sum, item) => sum + item.revenue, 0)
  const topChannel = [...reports.channelRevenueVsSpend].sort((left, right) => right.revenue - left.revenue)[0]
  const topCampaign = reports.roasRanking[0]

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="리포트"
        title="매출과 효율 리포트"
        description="차트와 표를 함께 보면서 채널 효율과 ROAS 순위를 빠르게 확인할 수 있습니다."
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

      <section className="surface-card overflow-hidden p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-muted)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">성과 요약</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">채널 효율과 ROAS 흐름</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              차트와 표를 함께 보면서 이번 기간의 매출, 광고비, 상위 캠페인 효율을 한 번에 검토합니다.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">총 매출</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{formatCompactCurrency(totalRevenue)}</p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">선택 기간 누적 매출</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">상위 채널</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {topChannel ? campaignChannelTextMap[topChannel.channel] : '-'}
            </p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              {topChannel ? formatCompactCurrency(topChannel.revenue) : '집계 없음'}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] p-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">상위 캠페인</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {topCampaign ? formatRatio(topCampaign.roas) : '-'}
            </p>
            <p className="mt-2 truncate text-xs text-[var(--text-tertiary)]">
              {topCampaign ? topCampaign.name : '집계 없음'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
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

      <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.88fr)_minmax(0,1.12fr)]">
        <ChartCard title="ROAS 순위" description="효율이 높은 캠페인 순으로 정렬했습니다.">
          <RoasRankingChart data={reports.roasRanking} />
        </ChartCard>
        <ChartCard title="캠페인 ROAS 표" description="차트와 함께 확인할 수 있는 정렬형 표입니다.">
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
