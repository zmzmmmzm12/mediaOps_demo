import { NextRequest, NextResponse } from 'next/server'
import { getReportsForRole } from '../../../src/mocks/data'
import { getDebugMode, getRoleFromRequest, jsonError, wait } from '../../../src/server/api-utils'

export async function GET(request: NextRequest) {
  await wait(300)
  const role = getRoleFromRequest(request)
  const mode = getDebugMode(request)

  if (!role) {
    return jsonError('인증 정보가 없습니다.', 401)
  }

  if (mode === 'error') {
    return jsonError('리포트 데이터를 불러오지 못했습니다.', 500)
  }

  if (mode === 'empty') {
    return NextResponse.json({
      reports: {
        revenueByPeriod: [],
        channelRevenueVsSpend: [],
        roasRanking: [],
      },
    })
  }

  const reports = getReportsForRole(role)

  if (!reports) {
    return jsonError('접근 권한이 없습니다.', 403)
  }

  return NextResponse.json({ reports })
}

