import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../../i18n/types'

type ThemeMode = 'light' | 'dark'

interface PreferencesState {
  theme: ThemeMode
  locale: Locale
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  setLocale: (locale: Locale) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      locale: 'ko',
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: 'mediaops-preferences',
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)
