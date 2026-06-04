import { NextRequest, NextResponse } from 'next/server'
import { createFilterPreset, listFilterPresets } from '../../../src/mocks/data'
import { jsonError, wait } from '../../../src/server/api-utils'

export async function GET() {
  await wait(150)
  return NextResponse.json({ presets: listFilterPresets() })
}

export async function POST(request: NextRequest) {
  await wait(180)
  const body = (await request.json()) as {
    name?: string
    filters?: Record<string, string>
  }

  if (!body.name || !body.filters) {
    return jsonError('프리셋 요청 데이터가 올바르지 않습니다.', 400)
  }

  return NextResponse.json({
    preset: createFilterPreset({
      name: body.name,
      filters: body.filters,
    }),
  })
}

