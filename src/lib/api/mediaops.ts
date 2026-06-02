import type {
  AuthMeResponse,
  CampaignDetailResponse,
  CampaignListResponse,
  CampaignMemoUpdateInput,
  CampaignMemoUpdateResponse,
  CampaignUpdateInput,
  CampaignUpdateResponse,
  CreateFilterPresetInput,
  CreateFilterPresetResponse,
  DashboardResponse,
  FilterPresetsResponse,
  LoginProfilesResponse,
  LoginResponse,
  ReportsResponse,
} from '../../types/mediaops'
import { fetchJson } from './client'

export function getCurrentUser() {
  return fetchJson<AuthMeResponse>('/api/auth/me')
}

export function getLoginProfiles() {
  return fetchJson<LoginProfilesResponse>('/api/auth/profiles')
}

export function loginWithProfile(userId: string) {
  return fetchJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export function getDashboard() {
  return fetchJson<DashboardResponse>('/api/dashboard')
}

export function getCampaigns() {
  return fetchJson<CampaignListResponse>('/api/campaigns')
}

export function getCampaignDetail(campaignId: string) {
  return fetchJson<CampaignDetailResponse>(`/api/campaigns/${campaignId}`)
}

export function updateCampaign(
  campaignId: string,
  input: CampaignUpdateInput,
) {
  return fetchJson<CampaignUpdateResponse>(`/api/campaigns/${campaignId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function updateCampaignMemo(
  campaignId: string,
  input: CampaignMemoUpdateInput,
) {
  return fetchJson<CampaignMemoUpdateResponse>(
    `/api/campaigns/${campaignId}/memo`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )
}

export function getReports() {
  return fetchJson<ReportsResponse>('/api/reports')
}

export function getFilterPresets() {
  return fetchJson<FilterPresetsResponse>('/api/filter-presets')
}

export function createFilterPreset(input: CreateFilterPresetInput) {
  return fetchJson<CreateFilterPresetResponse>('/api/filter-presets', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteFilterPreset(presetId: string) {
  return fetchJson<{ success: true }>(`/api/filter-presets/${presetId}`, {
    method: 'DELETE',
  })
}
