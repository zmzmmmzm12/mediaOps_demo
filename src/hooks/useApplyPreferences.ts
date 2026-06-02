import { useEffect } from 'react'
import { usePreferencesStore } from '../features/ui/preferences-store'

export function useApplyPreferences() {
  const theme = usePreferencesStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
