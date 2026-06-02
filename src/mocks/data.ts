import { hasPermission } from '../features/auth/permissions'
import { deriveCampaignSummary } from '../features/campaigns/summary'
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from '../lib/format'
import { campaignChannelTextMap } from '../lib/labels'
import type {
  ActivityItem,
  Campaign,
  CampaignChannel,
  CampaignDetail,
  CreativePerformance,
  DashboardAlert,
  DashboardSnapshot,
  DeliveryPoint,
  FilterPreset,
  ReportSnapshot,
  SessionUser,
  UserRole,
} from '../types/mediaops'

const profiles: SessionUser[] = [
  { id: 'user-admin', name: 'Mina Park', email: 'mina.park@mediaops.local', role: 'admin' },
  { id: 'user-manager', name: 'Jumi Lee', email: 'jumi.lee@mediaops.local', role: 'manager' },
  { id: 'user-viewer', name: 'Sora Lee', email: 'sora.lee@mediaops.local', role: 'viewer' },
]

const seedCampaigns: Campaign[] = [
  {
    id: 'camp-orbit-q3',
    name: '오르빗 3분기 성장',
    status: 'active',
    channel: 'meta',
    budget: 180000,
    spend: 126400,
    revenue: 352100,
    roas: 2.79,
    conversionRate: 4.32,
    impressions: 1240000,
    clicks: 62000,
    conversions: 2678,
    startDate: '2026-05-08',
    endDate: '2026-07-12',
    managerName: 'Jumi Lee',
    memo: '소재는 5일 단위로 교체 중이며, 잠재 고객 타깃이 리타게팅보다 높은 효율을 보이고 있습니다.',
    priority: 'critical',
  },
  {
    id: 'camp-cascade-b2b',
    name: '캐스케이드 B2B 수요 확대',
    status: 'active',
    channel: 'google',
    budget: 142000,
    spend: 108900,
    revenue: 251700,
    roas: 2.31,
    conversionRate: 2.18,
    impressions: 512000,
    clicks: 22400,
    conversions: 488,
    startDate: '2026-04-24',
    endDate: '2026-06-30',
    managerName: 'Mina Park',
    memo: '리드 품질이 소폭 하락해 저의도 키워드 구간의 입찰 상한을 조정했습니다.',
    priority: 'critical',
  },
  {
    id: 'camp-lumen-retail',
    name: '루멘 리테일 회복',
    status: 'paused',
    channel: 'naver',
    budget: 98000,
    spend: 65400,
    revenue: 123800,
    roas: 1.89,
    conversionRate: 1.76,
    impressions: 388000,
    clicks: 13120,
    conversions: 231,
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    managerName: 'Nadia Cho',
    memo: '지역 지면 성과 저하로 일시중지했으며, 랜딩 페이지 정합성을 점검 중입니다.',
    priority: 'steady',
  },
  {
    id: 'camp-halo-stream',
    name: '헤일로 스트리밍 런칭',
    status: 'active',
    channel: 'kakao',
    budget: 76000,
    spend: 18800,
    revenue: 54100,
    roas: 2.88,
    conversionRate: 3.41,
    impressions: 294000,
    clicks: 10200,
    conversions: 348,
    startDate: '2026-06-01',
    endDate: '2026-07-22',
    managerName: 'Jumi Lee',
    memo: '런칭 초기 구간은 안정적이며, 첫 주 종료 후 타깃 확장을 검토할 예정입니다.',
    priority: 'planned',
  },
  {
    id: 'camp-verdant-renewal',
    name: '버던트 재구매 확대',
    status: 'ended',
    channel: 'meta',
    budget: 42000,
    spend: 41120,
    revenue: 128400,
    roas: 3.12,
    conversionRate: 5.44,
    impressions: 166000,
    clicks: 9020,
    conversions: 491,
    startDate: '2026-03-10',
    endDate: '2026-05-22',
    managerName: 'Avery Stone',
    memo: '운영 종료 완료. 최종 코호트 유지율이 벤치마크를 상회했습니다.',
    priority: 'steady',
  },
  {
    id: 'camp-nova-subscription',
    name: '노바 구독 전환 증대',
    status: 'active',
    channel: 'google',
    budget: 124000,
    spend: 73400,
    revenue: 198200,
    roas: 2.70,
    conversionRate: 3.84,
    impressions: 602000,
    clicks: 24100,
    conversions: 925,
    startDate: '2026-05-28',
    endDate: '2026-07-05',
    managerName: 'Mina Park',
    memo: '검색과 유튜브 성과가 균형적이며, 체험 시작 수는 목표보다 빠르게 증가하고 있습니다.',
    priority: 'steady',
  },
  {
    id: 'camp-pulse-commerce',
    name: '펄스 커머스 주말 특가',
    status: 'paused',
    channel: 'kakao',
    budget: 56000,
    spend: 29100,
    revenue: 46800,
    roas: 1.61,
    conversionRate: 1.38,
    impressions: 208000,
    clicks: 7040,
    conversions: 97,
    startDate: '2026-05-12',
    endDate: '2026-06-14',
    managerName: 'Nadia Cho',
    memo: '주말 성과 하락 이후 일시중지했으며, 소재와 프로모션 메시지 보완이 필요합니다.',
    priority: 'critical',
  },
]

const campaignStore = seedCampaigns.map((campaign) => ({ ...campaign }))

let filterPresetStore: FilterPreset[] = [
  {
    id: 'preset-active-google',
    name: '구글 운영 중',
    filters: {
      search: '',
      status: 'active',
      channel: 'google',
      startDate: '',
      endDate: '',
      sortBy: 'revenue',
      sortDirection: 'desc',
      page: '1',
      pageSize: '5',
    },
    createdAt: '2026-06-01T09:00:00.000Z',
  },
]

function getVisibleCampaigns(role: UserRole) {
  switch (role) {
    case 'admin':
      return campaignStore
    case 'manager':
      return campaignStore
    case 'viewer':
      return campaignStore
  }
}

function average(items: number[]) {
  const total = items.reduce((sum, value) => sum + value, 0)
  return items.length > 0 ? total / items.length : 0
}

function getRoleHeadline(role: UserRole) {
  if (role === 'admin') {
    return {
      headline: '매출은 상승 중이지만 일부 캠페인은 추가 점검이 필요합니다.',
      subheadline: '관리자 화면에서는 포트폴리오 전체 성과, 채널 운영 속도, 리스크 신호를 함께 확인합니다.',
    }
  }

  if (role === 'manager') {
    return {
      headline: '핵심 캠페인은 계획대로 운영 중이며 일부 회복 구간만 점검하면 됩니다.',
      subheadline: '매니저 화면은 운영 실행과 매출 흐름을 빠르게 확인하는 데 초점을 둡니다.',
    }
  }

  return {
    headline: '최신 기준의 성과 현황을 읽기 전용으로 확인할 수 있습니다.',
    subheadline: '조회 전용 계정은 리포트와 운영 현황을 확인할 수 있지만 수정 기능은 잠겨 있습니다.',
  }
}

function buildDashboardAlerts(campaigns: Campaign[]): DashboardAlert[] {
  return campaigns
    .filter((campaign) => campaign.roas < 2 || campaign.status === 'paused')
    .slice(0, 4)
    .map((campaign) => ({
      id: `alert-${campaign.id}`,
      title:
        campaign.status === 'paused'
          ? `${campaign.name} 캠페인이 일시중지 상태입니다`
          : `${campaign.name} 캠페인의 ROAS가 목표보다 낮습니다`,
      detail:
        campaign.status === 'paused'
          ? '재집행 전 채널 믹스와 소재 준비 상태를 다시 확인해 주세요.'
          : `현재 ROAS는 ${campaign.roas.toFixed(2)}이며, 누적 광고비는 ${formatCurrency(campaign.spend)}입니다.`,
      tone: campaign.status === 'paused' || campaign.roas < 2 ? 'warning' : 'neutral',
    }))
}

function buildTrend(): DeliveryPoint[] {
  return [
    { date: '2026-05-27', spend: 62400, revenue: 156900, roas: 2.51, conversionRate: 3.12 },
    { date: '2026-05-28', spend: 64800, revenue: 163200, roas: 2.52, conversionRate: 3.18 },
    { date: '2026-05-29', spend: 68200, revenue: 172500, roas: 2.53, conversionRate: 3.24 },
    { date: '2026-05-30', spend: 70100, revenue: 180400, roas: 2.57, conversionRate: 3.29 },
    { date: '2026-05-31', spend: 71900, revenue: 187900, roas: 2.61, conversionRate: 3.35 },
    { date: '2026-06-01', spend: 74400, revenue: 195600, roas: 2.63, conversionRate: 3.41 },
    { date: '2026-06-02', spend: 76200, revenue: 201800, roas: 2.65, conversionRate: 3.46 },
  ]
}

function buildDashboard(role: UserRole): DashboardSnapshot {
  const campaigns = getVisibleCampaigns(role)
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0)
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  const avgRoas = average(campaigns.map((campaign) => campaign.roas))
  const avgConversionRate = average(
    campaigns.map((campaign) => campaign.conversionRate),
  )
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === 'active',
  ).length
  const { headline, subheadline } = getRoleHeadline(role)

  return {
    headline,
    subheadline,
    metrics: [
      {
        id: 'total-revenue',
        label: '총 매출',
        value: formatCompactCurrency(totalRevenue),
        delta: '전월 대비 +12.4%',
        tone: 'positive',
      },
      {
        id: 'total-spend',
        label: '총 광고비',
        value: formatCompactCurrency(totalSpend),
        delta: '전월 대비 +5.7%',
        tone: 'neutral',
      },
      {
        id: 'avg-roas',
        label: '평균 ROAS',
        value: `${avgRoas.toFixed(2)}x`,
        delta: '전월 대비 +0.18',
        tone: 'positive',
      },
      {
        id: 'avg-conversion-rate',
        label: '평균 전환율',
        value: formatPercent(avgConversionRate),
        delta: '전월 대비 +0.24%p',
        tone: 'positive',
      },
      {
        id: 'active-campaigns',
        label: '운영 중 캠페인',
        value: String(activeCampaigns),
        delta: `비활성 ${campaigns.length - activeCampaigns}개`,
        tone: activeCampaigns > 0 ? 'neutral' : 'warning',
      },
    ],
    trend: buildTrend().map((point) => ({
      date: point.date,
      revenue: point.revenue,
      spend: point.spend,
    })),
    statusDistribution: [
      { status: 'active', count: campaigns.filter((item) => item.status === 'active').length },
      { status: 'paused', count: campaigns.filter((item) => item.status === 'paused').length },
      { status: 'ended', count: campaigns.filter((item) => item.status === 'ended').length },
    ],
    topCampaigns: [...campaigns]
      .sort((left, right) => right.roas - left.roas)
      .slice(0, 5),
    alerts: buildDashboardAlerts(campaigns),
  }
}

function buildCreatives(campaign: Campaign): CreativePerformance[] {
  return [
    {
      id: `${campaign.id}-creative-1`,
      creativeName: `${campaign.name} 메인 영상`,
      impressions: Math.round(campaign.impressions * 0.42),
      clicks: Math.round(campaign.clicks * 0.4),
      conversions: Math.round(campaign.conversions * 0.38),
      revenue: Math.round(campaign.revenue * 0.41),
      spend: Math.round(campaign.spend * 0.37),
      roas: Number((campaign.roas + 0.18).toFixed(2)),
      conversionRate: Number((campaign.conversionRate + 0.22).toFixed(2)),
    },
    {
      id: `${campaign.id}-creative-2`,
      creativeName: `${campaign.name} 상품 캐러셀`,
      impressions: Math.round(campaign.impressions * 0.33),
      clicks: Math.round(campaign.clicks * 0.34),
      conversions: Math.round(campaign.conversions * 0.35),
      revenue: Math.round(campaign.revenue * 0.31),
      spend: Math.round(campaign.spend * 0.34),
      roas: Number((campaign.roas - 0.12).toFixed(2)),
      conversionRate: Number((campaign.conversionRate - 0.08).toFixed(2)),
    },
    {
      id: `${campaign.id}-creative-3`,
      creativeName: `${campaign.name} 숏폼 영상`,
      impressions: Math.round(campaign.impressions * 0.25),
      clicks: Math.round(campaign.clicks * 0.26),
      conversions: Math.round(campaign.conversions * 0.27),
      revenue: Math.round(campaign.revenue * 0.28),
      spend: Math.round(campaign.spend * 0.29),
      roas: Number(campaign.roas.toFixed(2)),
      conversionRate: Number(campaign.conversionRate.toFixed(2)),
    },
  ]
}

function buildChannelComparison(campaign: Campaign) {
  const otherChannels = (
    ['google', 'meta', 'naver', 'kakao'] as CampaignChannel[]
  ).filter((channel) => channel !== campaign.channel)

  return [
    {
      channel: campaign.channel,
      revenue: Math.round(campaign.revenue * 0.54),
      spend: Math.round(campaign.spend * 0.51),
      roas: Number((campaign.roas + 0.08).toFixed(2)),
    },
    ...otherChannels.slice(0, 2).map((channel, index) => ({
      channel,
      revenue: Math.round(campaign.revenue * (0.17 - index * 0.03)),
      spend: Math.round(campaign.spend * (0.18 - index * 0.03)),
      roas: Number((campaign.roas - 0.1 - index * 0.12).toFixed(2)),
    })),
  ]
}

function buildActivity(campaign: Campaign): ActivityItem[] {
  return [
    {
      id: `${campaign.id}-act-1`,
      timeLabel: '오늘',
      actor: campaign.managerName,
      message: `${campaignChannelTextMap[campaign.channel]} 채널 집행 속도를 점검하고 현재 예산 가드레일을 확인했습니다.`,
    },
    {
      id: `${campaign.id}-act-2`,
      timeLabel: '어제',
      actor: '크리에이티브 운영',
      message: `${campaign.name} 캠페인의 랜딩 페이지 정합성 메모를 업데이트했습니다.`,
    },
    {
      id: `${campaign.id}-act-3`,
      timeLabel: '5월 30일',
      actor: '데이터 분석',
      message: '주간 ROAS 요약과 채널 효율 비교 리포트를 공유했습니다.',
    },
  ]
}

function buildDetailSeries(campaign: Campaign): DeliveryPoint[] {
  const baseRevenue = campaign.revenue / 7
  const baseSpend = campaign.spend / 7
  const baseRoas = campaign.roas
  const baseConversionRate = campaign.conversionRate

  return Array.from({ length: 7 }).map((_, index) => ({
    date: `2026-05-${String(27 + index).padStart(2, '0')}`,
    spend: Math.round(baseSpend * (0.88 + index * 0.04)),
    revenue: Math.round(baseRevenue * (0.86 + index * 0.05)),
    roas: Number((baseRoas * (0.96 + index * 0.01)).toFixed(2)),
    conversionRate: Number((baseConversionRate * (0.94 + index * 0.015)).toFixed(2)),
  }))
}

function buildReports(): ReportSnapshot {
  return {
    revenueByPeriod: [
      { period: 'Jan', revenue: 218000 },
      { period: 'Feb', revenue: 241000 },
      { period: 'Mar', revenue: 264000 },
      { period: 'Apr', revenue: 279000 },
      { period: 'May', revenue: 322000 },
      { period: 'Jun', revenue: 351000 },
    ],
    channelRevenueVsSpend: (
      ['google', 'meta', 'naver', 'kakao'] as CampaignChannel[]
    ).map((channel) => {
      const channelCampaigns = campaignStore.filter((campaign) => campaign.channel === channel)
      return {
        channel,
        revenue: channelCampaigns.reduce((sum, campaign) => sum + campaign.revenue, 0),
        spend: channelCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0),
      }
    }),
    roasRanking: [...campaignStore].sort((left, right) => right.roas - left.roas),
  }
}

export function getProfiles() {
  return profiles
}

export function findProfile(userId: string) {
  return profiles.find((profile) => profile.id === userId) ?? null
}

export function getCurrentUser(userId: string | null) {
  if (!userId) {
    return null
  }

  return findProfile(userId)
}

export function buildDashboardForRole(role: UserRole) {
  return buildDashboard(role)
}

export function listCampaigns(role: UserRole) {
  if (!hasPermission(role, 'campaigns:view')) {
    return null
  }

  const campaigns = getVisibleCampaigns(role)
  return {
    campaigns,
    total: campaigns.length,
  }
}

export function getCampaignDetailForRole(
  role: UserRole,
  campaignId: string,
): CampaignDetail | null {
  if (!hasPermission(role, 'campaigns:view')) {
    return null
  }

  const campaign = getVisibleCampaigns(role).find((item) => item.id === campaignId)

  if (!campaign) {
    return null
  }

  return {
    campaign,
    summary: deriveCampaignSummary(campaign),
    delivery: buildDetailSeries(campaign),
    creatives: buildCreatives(campaign),
    channelComparison: buildChannelComparison(campaign),
    activity: buildActivity(campaign),
  }
}

export function updateCampaignForRole(
  role: UserRole,
  campaignId: string,
  update: Partial<Pick<Campaign, 'status' | 'priority'>>,
) {
  if (!hasPermission(role, 'campaigns:edit')) {
    return null
  }

  const index = campaignStore.findIndex((campaign) => campaign.id === campaignId)

  if (index === -1) {
    return null
  }

  campaignStore[index] = {
    ...campaignStore[index],
    ...update,
  }

  return campaignStore[index]
}

export function updateCampaignMemoForRole(
  role: UserRole,
  campaignId: string,
  memo: string,
) {
  if (!hasPermission(role, 'campaigns:edit')) {
    return null
  }

  const index = campaignStore.findIndex((campaign) => campaign.id === campaignId)

  if (index === -1) {
    return null
  }

  campaignStore[index] = {
    ...campaignStore[index],
    memo,
  }

  return campaignStore[index]
}

export function getReportsForRole(role: UserRole) {
  if (!hasPermission(role, 'reports:view')) {
    return null
  }

  return buildReports()
}

export function listFilterPresets() {
  return filterPresetStore
}

export function createFilterPreset(input: {
  name: string
  filters: Record<string, string>
}) {
  const preset: FilterPreset = {
    id: `preset-${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim() || '이름 없는 프리셋',
    filters: input.filters,
    createdAt: new Date().toISOString(),
  }

  filterPresetStore = [preset, ...filterPresetStore].slice(0, 10)
  return preset
}

export function deleteFilterPreset(presetId: string) {
  const before = filterPresetStore.length
  filterPresetStore = filterPresetStore.filter((preset) => preset.id !== presetId)
  return before !== filterPresetStore.length
}

export function getRoleErrorMode(
  role: UserRole,
  target: 'dashboard' | 'campaigns' | 'reports',
) {
  if (role === 'viewer' && target === 'dashboard') {
    return false
  }

  return false
}
