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
      return HttpResponse.json({ message: '데모 계정을 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json({ user: profile })
  }),

  http.get('/api/dashboard', async ({ request }) => {
    await delay(300)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: '대시보드 데이터를 불러오지 못했습니다.' }, { status: 500 })
    }

    if (mode === 'empty') {
      return HttpResponse.json({
        dashboard: {
          headline: '아직 표시할 데이터가 없습니다.',
          subheadline: '데이터 소스를 더 연결하거나 기간 범위를 넓혀보세요.',
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
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: '캠페인 목록을 불러오지 못했습니다.' }, { status: 500 })
    }

    if (mode === 'empty') {
      return HttpResponse.json({ campaigns: [], total: 0 })
    }

    const result = listCampaigns(role)

    if (!result) {
      return HttpResponse.json({ message: '접근 권한이 없습니다.' }, { status: 403 })
    }

    return HttpResponse.json(result)
  }),

  http.get('/api/campaigns/:campaignId', async ({ params, request }) => {
    await delay(260)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: '캠페인 상세 데이터를 불러오지 못했습니다.' }, { status: 500 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: '캠페인 ID가 필요합니다.' }, { status: 400 })
    }

    const detail = getCampaignDetailForRole(role, campaignId)

    if (!detail) {
      return HttpResponse.json({ message: '캠페인을 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json({ detail })
  }),

  http.patch('/api/campaigns/:campaignId', async ({ params, request }) => {
    await delay(320)
    const role = getRoleFromHeaders(request.headers)

    if (!role) {
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: '캠페인 ID가 필요합니다.' }, { status: 400 })
    }

    const body = (await request.json()) as {
      status?: 'active' | 'paused' | 'ended'
      priority?: 'critical' | 'steady' | 'planned'
    }
    const campaign = updateCampaignForRole(role, campaignId, body)

    if (!campaign) {
      return HttpResponse.json({ message: '수정 권한이 없습니다.' }, { status: 403 })
    }

    return HttpResponse.json({ campaign })
  }),

  http.patch('/api/campaigns/:campaignId/memo', async ({ params, request }) => {
    await delay(360)
    const role = getRoleFromHeaders(request.headers)

    if (!role) {
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    const campaignId = params.campaignId

    if (typeof campaignId !== 'string') {
      return HttpResponse.json({ message: '캠페인 ID가 필요합니다.' }, { status: 400 })
    }

    const body = (await request.json()) as { memo?: string }

    if (typeof body.memo !== 'string') {
      return HttpResponse.json({ message: '메모 내용이 필요합니다.' }, { status: 400 })
    }

    const campaign = updateCampaignMemoForRole(role, campaignId, body.memo)

    if (!campaign) {
      return HttpResponse.json({ message: '메모 수정 권한이 없습니다.' }, { status: 403 })
    }

    return HttpResponse.json({ campaign })
  }),

  http.get('/api/reports', async ({ request }) => {
    await delay(300)
    const role = getRoleFromHeaders(request.headers)
    const mode = getDebugMode(request.url)

    if (!role) {
      return HttpResponse.json({ message: '인증 정보가 없습니다.' }, { status: 401 })
    }

    if (mode === 'error') {
      return HttpResponse.json({ message: '리포트 데이터를 불러오지 못했습니다.' }, { status: 500 })
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
      return HttpResponse.json({ message: '접근 권한이 없습니다.' }, { status: 403 })
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
      return HttpResponse.json({ message: '프리셋 요청 데이터가 올바르지 않습니다.' }, { status: 400 })
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
      return HttpResponse.json({ message: '프리셋 ID가 필요합니다.' }, { status: 400 })
    }

    const deleted = deleteFilterPreset(presetId)

    if (!deleted) {
      return HttpResponse.json({ message: '프리셋을 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),
]
