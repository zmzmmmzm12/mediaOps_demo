import { NextRequest, NextResponse } from 'next/server'
import { buildDashboardForRole } from '../../../src/mocks/data'
import { getDebugMode, getRoleFromRequest, jsonError, wait } from '../../../src/server/api-utils'

export async function GET(request: NextRequest) {
  await wait(300)
  const role = getRoleFromRequest(request)
  const mode = getDebugMode(request)

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  if (mode === 'error') {
    return jsonError('대시보드 데이터를 불러오지 못했습니다.', 500)
  }

  if (mode === 'empty') {
    return NextResponse.json({
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

  return NextResponse.json({ dashboard: buildDashboardForRole(role) })
}

