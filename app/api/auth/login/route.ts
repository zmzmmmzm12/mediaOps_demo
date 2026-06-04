import { NextRequest, NextResponse } from 'next/server'
import { findProfile } from '../../../../src/mocks/data'
import { jsonError, wait } from '../../../../src/server/api-utils'

export async function POST(request: NextRequest) {
  await wait(260)
  const body = (await request.json()) as { userId?: string }
  const profile = body.userId ? findProfile(body.userId) : null

  if (!profile) {
    return jsonError('데모 계정을 찾을 수 없습니다.', 404)
  }

  return NextResponse.json({ user: profile })
}

