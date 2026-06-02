import type { CampaignChannel, CampaignStatus } from '../../types/mediaops'

export type CampaignSortField =
  | 'revenue'
  | 'spend'
  | 'roas'
  | 'conversionRate'

export type SortDirection = 'asc' | 'desc'

export interface CampaignFilters {
  search: string
  status: CampaignStatus | 'all'
  channel: CampaignChannel | 'all'
  startDate: string
  endDate: string
  sortBy: CampaignSortField
  sortDirection: SortDirection
  page: number
  pageSize: number
}

export interface CampaignFilterPresetState {
  presets: Array<{
    id: string
    name: string
    filters: CampaignFilters
    createdAt: string
  }>
  savePreset: (name: string, filters: CampaignFilters) => {
    id: string
    name: string
    filters: CampaignFilters
    createdAt: string
  }
  deletePreset: (presetId: string) => void
}
