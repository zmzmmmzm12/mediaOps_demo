import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { UserRole } from '../types/mediaops'

export function getRoleFromRequest(request: NextRequest): UserRole | null {
  const role = request.headers.get('x-mediaops-user-role')

  if (role === 'admin' || role === 'manager' || role === 'viewer') {
    return role
  }

  return null
}

export function getUserIdFromRequest(request: NextRequest) {
  return request.headers.get('x-mediaops-user-id')
}

export function getDebugMode(request: NextRequest) {
  return request.nextUrl.searchParams.get('mock')
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}

export async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

