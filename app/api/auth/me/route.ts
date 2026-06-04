import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../src/mocks/data'
import { getUserIdFromRequest, wait } from '../../../../src/server/api-utils'

export async function GET(request: NextRequest) {
  await wait(180)
  const user = getCurrentUser(getUserIdFromRequest(request))
  return NextResponse.json({ user })
}

