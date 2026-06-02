import type { CampaignFilters, CampaignSortField, SortDirection } from './types'
import type { CampaignChannel, CampaignStatus } from '../../types/mediaops'

function isCampaignStatus(value: string | null): value is CampaignStatus {
  return value === 'active' || value === 'paused' || value === 'ended'
}

function isCampaignChannel(value: string | null): value is CampaignChannel {
  return value === 'google' || value === 'meta' || value === 'naver' || value === 'kakao'
}

function isSortField(value: string | null): value is CampaignSortField {
  return (
    value === 'revenue' ||
    value === 'spend' ||
    value === 'roas' ||
    value === 'conversionRate'
  )
}

function isSortDirection(value: string | null): value is SortDirection {
  return value === 'asc' || value === 'desc'
}

export const defaultCampaignFilters: CampaignFilters = {
  search: '',
  status: 'all',
  channel: 'all',
  startDate: '',
  endDate: '',
  sortBy: 'revenue',
  sortDirection: 'desc',
  page: 1,
  pageSize: 5,
}

export function parseCampaignFilters(searchParams: URLSearchParams): CampaignFilters {
  const statusParam = searchParams.get('status')
  const channelParam = searchParams.get('channel')
  const sortByParam = searchParams.get('sortBy')
  const sortDirectionParam = searchParams.get('sortDirection')
  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '5')

  return {
    search: searchParams.get('search') ?? '',
    status: isCampaignStatus(statusParam) ? statusParam : 'all',
    channel: isCampaignChannel(channelParam) ? channelParam : 'all',
    startDate: searchParams.get('startDate') ?? '',
    endDate: searchParams.get('endDate') ?? '',
    sortBy: isSortField(sortByParam) ? sortByParam : 'revenue',
    sortDirection: isSortDirection(sortDirectionParam) ? sortDirectionParam : 'desc',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 5,
  }
}

export function buildCampaignSearchParams(filters: CampaignFilters) {
  const searchParams = new URLSearchParams()

  if (filters.search) {
    searchParams.set('search', filters.search)
  }

  if (filters.status !== 'all') {
    searchParams.set('status', filters.status)
  }

  if (filters.channel !== 'all') {
    searchParams.set('channel', filters.channel)
  }

  if (filters.startDate) {
    searchParams.set('startDate', filters.startDate)
  }

  if (filters.endDate) {
    searchParams.set('endDate', filters.endDate)
  }

  searchParams.set('sortBy', filters.sortBy)
  searchParams.set('sortDirection', filters.sortDirection)
  searchParams.set('page', String(filters.page))
  searchParams.set('pageSize', String(filters.pageSize))

  return searchParams
}
