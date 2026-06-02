import type { SessionUser } from '../../types/mediaops'

export interface AuthState {
  session: SessionUser | null
  setSession: (session: SessionUser) => void
  clearSession: () => void
}
