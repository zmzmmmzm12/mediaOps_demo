import { NextResponse } from 'next/server'
import { getProfiles } from '../../../../src/mocks/data'
import { wait } from '../../../../src/server/api-utils'

export async function GET() {
  await wait(150)
  return NextResponse.json({ profiles: getProfiles() })
}

