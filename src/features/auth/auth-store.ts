import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from './types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'mediaops-auth',
      partialize: (state) => ({ session: state.session }),
    },
  ),
)
