import { useAuthStore } from '../../features/auth/auth-store'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const session = useAuthStore.getState().session
  const headers = new Headers(init?.headers)

  headers.set('Content-Type', 'application/json')

  if (session) {
    headers.set('x-mediaops-user-id', session.id)
    headers.set('x-mediaops-user-role', session.role)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null

    throw new ApiError(
      errorBody?.message ?? 'Request failed',
      response.status,
    )
  }

  return (await response.json()) as T
}
