import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from './types'
import { normalizeUserRole } from './permissions'

function normalizeSession(session: AuthState['session']): AuthState['session'] {
  if (!session) {
    return null
  }

  const normalizedRole = normalizeUserRole(session.role)

  if (!normalizedRole) {
    return null
  }

  return {
    ...session,
    role: normalizedRole,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session: normalizeSession(session) }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'mediaops-auth',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as AuthState | undefined

        if (!state) {
          return { session: null }
        }

        return {
          ...state,
          session: normalizeSession(state.session),
        }
      },
      partialize: (state) => ({ session: state.session }),
    },
  ),
)
