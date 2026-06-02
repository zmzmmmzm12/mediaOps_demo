import { hasPermission } from '../features/auth/permissions'
import { deriveCampaignSummary } from '../features/campaigns/summary'
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from '../lib/format'
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
  { id: 'user-manager', name: 'Daniel Kim', email: 'daniel.kim@mediaops.local', role: 'manager' },
  { id: 'user-viewer', name: 'Sora Lee', email: 'sora.lee@mediaops.local', role: 'viewer' },
]

const seedCampaigns: Campaign[] = [
  {
    id: 'camp-orbit-q3',
    name: 'Orbit Q3 Growth',
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
    managerName: 'Daniel Kim',
    memo: 'Creative rotation every 5 days. Prospecting is outperforming retargeting.',
    priority: 'critical',
  },
  {
    id: 'camp-cascade-b2b',
    name: 'Cascade B2B Demand',
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
    memo: 'Lead quality dipped slightly; bid caps were tightened on lower intent terms.',
    priority: 'critical',
  },
  {
    id: 'camp-lumen-retail',
    name: 'Lumen Retail Recovery',
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
    memo: 'Paused due to underperforming local placements; investigating landing page mismatch.',
    priority: 'steady',
  },
  {
    id: 'camp-halo-stream',
    name: 'Halo Streaming Launch',
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
    managerName: 'Daniel Kim',
    memo: 'Launch phase stable. Audience expansion planned after first full week.',
    priority: 'planned',
  },
  {
    id: 'camp-verdant-renewal',
    name: 'Verdant Renewal Push',
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
    memo: 'Completed. Final cohort retained above benchmark.',
    priority: 'steady',
  },
  {
    id: 'camp-nova-subscription',
    name: 'Nova Subscription Lift',
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
    memo: 'Search and YouTube are balanced. Trial starts are pacing above target.',
    priority: 'steady',
  },
  {
    id: 'camp-pulse-commerce',
    name: 'Pulse Commerce Weekend',
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
    memo: 'Paused after weekend decay. Creative and offer need refresh.',
    priority: 'critical',
  },
]

const campaignStore = seedCampaigns.map((campaign) => ({ ...campaign }))

let filterPresetStore: FilterPreset[] = [
  {
    id: 'preset-active-google',
    name: 'Active Google',
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
      headline: 'Revenue is up while two campaign lanes still need recovery.',
      subheadline: 'Admin view combines portfolio health, channel pacing, and risk signals.',
    }
  }

  if (role === 'manager') {
    return {
      headline: 'Core campaigns are on plan with one paused recovery lane.',
      subheadline: 'Manager view focuses on quick action across delivery and revenue.',
    }
  }

  return {
    headline: 'Read-only performance views are current for the latest refresh.',
    subheadline: 'Viewer access keeps reporting visible while editing actions stay locked.',
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
          ? `${campaign.name} is paused`
          : `${campaign.name} is below target ROAS`,
      detail:
        campaign.status === 'paused'
          ? 'Review channel mix and creative readiness before restarting delivery.'
          : `Current ROAS is ${campaign.roas.toFixed(2)} with ${formatCurrency(campaign.spend)} spent.`,
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
        label: 'Total revenue',
        value: formatCompactCurrency(totalRevenue),
        delta: '+12.4% vs last month',
        tone: 'positive',
      },
      {
        id: 'total-spend',
        label: 'Total ad spend',
        value: formatCompactCurrency(totalSpend),
        delta: '+5.7% vs last month',
        tone: 'neutral',
      },
      {
        id: 'avg-roas',
        label: 'Average ROAS',
        value: `${avgRoas.toFixed(2)}x`,
        delta: '+0.18 vs last month',
        tone: 'positive',
      },
      {
        id: 'avg-conversion-rate',
        label: 'Average conversion rate',
        value: formatPercent(avgConversionRate),
        delta: '+0.24pt vs last month',
        tone: 'positive',
      },
      {
        id: 'active-campaigns',
        label: 'Active campaigns',
        value: String(activeCampaigns),
        delta: `${campaigns.length - activeCampaigns} inactive`,
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
      creativeName: `${campaign.name} Hero Cut`,
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
      creativeName: `${campaign.name} Product Carousel`,
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
      creativeName: `${campaign.name} Short Video`,
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
      timeLabel: 'Today',
      actor: campaign.managerName,
      message: `Reviewed ${campaign.channel} pacing and confirmed current budget guardrails.`,
    },
    {
      id: `${campaign.id}-act-2`,
      timeLabel: 'Yesterday',
      actor: 'Creative Ops',
      message: `Updated landing page alignment notes for ${campaign.name}.`,
    },
    {
      id: `${campaign.id}-act-3`,
      timeLabel: 'May 30',
      actor: 'Analytics',
      message: `Published weekly ROAS summary and channel efficiency comparison.`,
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
    name: input.name.trim() || 'Untitled preset',
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
