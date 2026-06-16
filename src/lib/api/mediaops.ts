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

type ApiRequestOptions = {
  signal?: AbortSignal
}

export function getCurrentUser(options?: ApiRequestOptions) {
  return fetchJson<AuthMeResponse>('/api/auth/me', {
    signal: options?.signal,
  })
}

export function getLoginProfiles(options?: ApiRequestOptions) {
  return fetchJson<LoginProfilesResponse>('/api/auth/profiles', {
    signal: options?.signal,
  })
}

export function loginWithProfile(userId: string) {
  return fetchJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export function getDashboard(options?: ApiRequestOptions) {
  return fetchJson<DashboardResponse>('/api/dashboard', {
    signal: options?.signal,
  })
}

export function getCampaigns(options?: ApiRequestOptions) {
  return fetchJson<CampaignListResponse>('/api/campaigns', {
    signal: options?.signal,
  })
}

export function getCampaignDetail(
  campaignId: string,
  options?: ApiRequestOptions,
) {
  return fetchJson<CampaignDetailResponse>(`/api/campaigns/${campaignId}`, {
    signal: options?.signal,
  })
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

export function getReports(options?: ApiRequestOptions) {
  return fetchJson<ReportsResponse>('/api/reports', {
    signal: options?.signal,
  })
}

export function getFilterPresets(options?: ApiRequestOptions) {
  return fetchJson<FilterPresetsResponse>('/api/filter-presets', {
    signal: options?.signal,
  })
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
