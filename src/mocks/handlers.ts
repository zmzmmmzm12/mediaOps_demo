import { delay, http, HttpResponse } from 'msw'
import type { UserRole } from '../types/mediaops'
import {
  buildDashboardForRole,
  createFilterPreset,
  deleteFilterPreset,
  findProfile,
  getCampaignDetailForRole,
  getCurrentUser,
  listFilterPresets,
  getProfiles,
  getReportsForRole,
  listCampaigns,
  updateCampaignForRole,
  updateCampaignMemoForRole,
} from './data'

function getRoleFromHeaders(headers: Headers): UserRole | null {
  const role = headers.get('x-mediaops-user-role')

  if (role === 'admin' || role === 'manager' || role === 'viewer') {
    return role
  }

  return null
}

function getUserIdFromHeaders(headers: Headers) {
  return headers.get('x-mediaops-user-id')
}

function getDebugMode(requestUrl: string) {
  const url = new URL(requestUrl)
  return url.searchParams.get('mock')
}

export const handlers = [
  http.get('/api/auth/me', async ({ request }) => {
    await delay(180)
    const user = getCurrentUser(getUserIdFromHeaders(request.headers))
    return HttpResponse.json({ user })
  }),

  http.get('/api/auth/profiles', async () => {
    await delay(150)
    return HttpResponse.json({ profiles: getProfiles() })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(260)
    const body = (await request.json()) as { userId?: string }
    const profile = body.userId ? findProfile(body.userId) : null

    if (!profile) {
      return HttpResponse.json({ message: 'Mock profile not found.' }, { status: 404 })
    }

    return HttpResponse.json({ user: profile })
  }),

  http.get('/api/dashboard', async ({ request }) => {
    await delay(300)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: 'Dashboard failed to load.' }, { status: 500 })
    }

    if (mode === 'empty') {
      return HttpResponse.json({
        dashboard: {
          headline: 'No data is available for this view yet.',
          subheadline: 'Connect more campaign sources or widen the date range.',
          metrics: [],
          trend: [],
          statusDistribution: [],
          topCampaigns: [],
          alerts: [],
        },
      })
    }

    return HttpResponse.json({ dashboard: buildDashboardForRole(role) })
  }),

  http.get('/api/campaigns', async ({ request }) => {
    await delay(280)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: 'Campaign list failed to load.' }, { status: 500 })
    }

    if (mode === 'empty') {
      return HttpResponse.json({ campaigns: [], total: 0 })
    }

    const result = listCampaigns(role)

    if (!result) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return HttpResponse.json(result)
  }),

  http.get('/api/campaigns/:campaignId', async ({ params, request }) => {
    await delay(260)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: 'Campaign detail failed to load.' }, { status: 500 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: 'Campaign id is required.' }, { status: 400 })
    }

    const detail = getCampaignDetailForRole(role, campaignId)

    if (!detail) {
      return HttpResponse.json({ message: 'Campaign not found.' }, { status: 404 })
    }

    return HttpResponse.json({ detail })
  }),

  http.patch('/api/campaigns/:campaignId', async ({ params, request }) => {
    await delay(320)
    const role = getRoleFromHeaders(request.headers)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: 'Campaign id is required.' }, { status: 400 })
    }

    const body = (await request.json()) as {
      status?: 'active' | 'paused' | 'ended'
      priority?: 'critical' | 'steady' | 'planned'
    }
    const campaign = updateCampaignForRole(role, campaignId, body)

    if (!campaign) {
      return HttpResponse.json({ message: 'Permission denied.' }, { status: 403 })
    }

    return HttpResponse.json({ campaign })
  }),

  http.patch('/api/campaigns/:campaignId/memo', async ({ params, request }) => {
    await delay(360)
    const role = getRoleFromHeaders(request.headers)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: 'Campaign id is required.' }, { status: 400 })
    }

    const body = (await request.json()) as { memo?: string }

    if (typeof body.memo !== 'string') {
      return HttpResponse.json({ message: 'Memo is required.' }, { status: 400 })
    }

    const campaign = updateCampaignMemoForRole(role, campaignId, body.memo)

    if (!campaign) {
      return HttpResponse.json({ message: 'Permission denied.' }, { status: 403 })
    }

    return HttpResponse.json({ campaign })
  }),

  http.get('/api/reports', async ({ request }) => {
    await delay(300)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: 'Reports failed to load.' }, { status: 500 })
    }

    if (mode === 'empty') {
      return HttpResponse.json({
        reports: {
          revenueByPeriod: [],
          channelRevenueVsSpend: [],
          roasRanking: [],
        },
      })
    }

    const reports = getReportsForRole(role)

    if (!reports) {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return HttpResponse.json({ reports })
  }),

  http.get('/api/filter-presets', async () => {
    await delay(150)
    return HttpResponse.json({ presets: listFilterPresets() })
  }),

  http.post('/api/filter-presets', async ({ request }) => {
    await delay(180)
    const body = (await request.json()) as {
      name?: string
      filters?: Record<string, string>
    }

    if (!body.name || !body.filters) {
      return HttpResponse.json({ message: 'Preset payload is invalid.' }, { status: 400 })
    }

    return HttpResponse.json({
      preset: createFilterPreset({
        name: body.name,
        filters: body.filters,
      }),
    })
  }),

  http.delete('/api/filter-presets/:presetId', async ({ params }) => {
    await delay(180)
    const presetId = params.presetId

    if (typeof presetId !== 'string') {
      return HttpResponse.json({ message: 'Preset id is required.' }, { status: 400 })
    }

    const deleted = deleteFilterPreset(presetId)

    if (!deleted) {
      return HttpResponse.json({ message: 'Preset not found.' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),
]
