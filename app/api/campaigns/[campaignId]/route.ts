import { NextRequest, NextResponse } from 'next/server'
import { getCampaignDetailForRole, updateCampaignForRole } from '../../../../src/mocks/data'
import { getDebugMode, getRoleFromRequest, jsonError, wait } from '../../../../src/server/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  await wait(260)
  const role = getRoleFromRequest(request)
  const mode = getDebugMode(request)
  const { campaignId } = await params

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  if (mode === 'error') {
    return jsonError('캠페인 상세 데이터를 불러오지 못했습니다.', 500)
  }

  const detail = getCampaignDetailForRole(role, campaignId)

  if (!detail) {
    return jsonError('캠페인을 찾을 수 없습니다.', 404)
  }

  return NextResponse.json({ detail })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  await wait(320)
  const role = getRoleFromRequest(request)
  const { campaignId } = await params

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  const body = (await request.json()) as {
    status?: 'active' | 'paused' | 'ended'
    priority?: 'critical' | 'steady' | 'planned'
  }
  const campaign = updateCampaignForRole(role, campaignId, body)

  if (!campaign) {
    return jsonError('수정 권한이 없습니다.', 403)
  }

  return NextResponse.json({ campaign })
}

