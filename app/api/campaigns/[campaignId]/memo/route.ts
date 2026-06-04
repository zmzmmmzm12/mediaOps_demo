import { NextRequest, NextResponse } from 'next/server'
import { updateCampaignMemoForRole } from '../../../../../src/mocks/data'
import { getRoleFromRequest, jsonError, wait } from '../../../../../src/server/api-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  await wait(360)
  const role = getRoleFromRequest(request)
  const { campaignId } = await params

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  const body = (await request.json()) as { memo?: string }

  if (typeof body.memo !== 'string') {
    return jsonError('메모 내용이 필요합니다.', 400)
  }

  const campaign = updateCampaignMemoForRole(role, campaignId, body.memo)

  if (!campaign) {
    return jsonError('메모 수정 권한이 없습니다.', 403)
  }

  return NextResponse.json({ campaign })
}

