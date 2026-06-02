export type UserRole = 'admin' | 'manager' | 'viewer'

export type CampaignStatus = 'active' | 'paused' | 'ended'
export type CampaignChannel = 'google' | 'meta' | 'naver' | 'kakao'
export type Priority = 'critical' | 'steady' | 'planned'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface LoginProfilesResponse {
  profiles: SessionUser[]
}

export interface LoginResponse {
  user: SessionUser
}

export interface AuthMeResponse {
  user: SessionUser | null
}

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  channel: CampaignChannel
  budget: number
  spend: number
  revenue: number
  roas: number
  conversionRate: number
  impressions: number
  clicks: number
  conversions: number
  startDate: string
  endDate: string
  managerName: string
  memo: string
  priority: Priority
}

export interface DashboardMetric {
  id: string
  label: string
  value: string
  delta: string
  tone: 'positive' | 'warning' | 'neutral'
}

export interface DashboardTrendPoint {
  date: string
  revenue: number
  spend: number
}

export interface DashboardStatusPoint {
  status: CampaignStatus
  count: number
}

export interface DashboardAlert {
  id: string
  title: string
  detail: string
  tone: 'positive' | 'warning' | 'neutral'
}

export interface DashboardSnapshot {
  headline: string
  subheadline: string
  metrics: DashboardMetric[]
  trend: DashboardTrendPoint[]
  statusDistribution: DashboardStatusPoint[]
  topCampaigns: Campaign[]
  alerts: DashboardAlert[]
}

export interface DashboardResponse {
  dashboard: DashboardSnapshot
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  total: number
}

export interface CampaignUpdateInput {
  status?: CampaignStatus
  priority?: Priority
}

export interface CampaignUpdateResponse {
  campaign: Campaign
}

export interface CampaignMemoUpdateInput {
  memo: string
}

export interface CampaignMemoUpdateResponse {
  campaign: Campaign
}

export interface DeliveryPoint {
  date: string
  spend: number
  revenue: number
  roas: number
  conversionRate: number
}

export interface CreativePerformance {
  id: string
  creativeName: string
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  spend: number
  roas: number
  conversionRate: number
}

export interface ChannelPerformance {
  channel: CampaignChannel
  revenue: number
  spend: number
  roas: number
}

export interface ActivityItem {
  id: string
  timeLabel: string
  actor: string
  message: string
}

export interface CampaignDetail {
  campaign: Campaign
  summary: {
    budgetUtilization: number
    pacing: string
    health: string
    nextMilestone: string
  }
  delivery: DeliveryPoint[]
  creatives: CreativePerformance[]
  channelComparison: ChannelPerformance[]
  activity: ActivityItem[]
}

export interface CampaignDetailResponse {
  detail: CampaignDetail
}

export interface ReportSnapshot {
  revenueByPeriod: Array<{
    period: string
    revenue: number
  }>
  channelRevenueVsSpend: Array<{
    channel: CampaignChannel
    revenue: number
    spend: number
  }>
  roasRanking: Campaign[]
}

export interface ReportsResponse {
  reports: ReportSnapshot
}

export interface FilterPreset {
  id: string
  name: string
  filters: Record<string, string>
  createdAt: string
}

export interface FilterPresetsResponse {
  presets: FilterPreset[]
}

export interface CreateFilterPresetInput {
  name: string
  filters: Record<string, string>
}

export interface CreateFilterPresetResponse {
  preset: FilterPreset
}
