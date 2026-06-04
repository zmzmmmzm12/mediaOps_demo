import { NextResponse } from 'next/server'
import { deleteFilterPreset } from '../../../../src/mocks/data'
import { jsonError, wait } from '../../../../src/server/api-utils'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ presetId: string }> },
) {
  await wait(180)
  const { presetId } = await params
  const deleted = deleteFilterPreset(presetId)

  if (!deleted) {
    return jsonError('프리셋을 찾을 수 없습니다.', 404)
  }

  return NextResponse.json({ success: true })
}
