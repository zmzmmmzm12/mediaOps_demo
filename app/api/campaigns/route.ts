import { NextRequest, NextResponse } from 'next/server'
import { listCampaigns } from '../../../src/mocks/data'
import { getDebugMode, getRoleFromRequest, jsonError, wait } from '../../../src/server/api-utils'

export async function GET(request: NextRequest) {
  await wait(280)
  const role = getRoleFromRequest(request)
  const mode = getDebugMode(request)

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  if (mode === 'error') {
    return jsonError('캠페인 목록을 불러오지 못했습니다.', 500)
  }

  if (mode === 'empty') {
    return NextResponse.json({ campaigns: [], total: 0 })
  }

  const result = listCampaigns(role)

  if (!result) {
    return jsonError('접근 권한이 없습니다.', 403)
  }

  return NextResponse.json(result)
}

