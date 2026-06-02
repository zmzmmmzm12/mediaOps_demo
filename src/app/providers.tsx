import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query-client'
import { useApplyPreferences } from '../hooks/useApplyPreferences'
import { ToastRegion } from '../components/ui/ToastRegion'

export function AppProviders({ children }: PropsWithChildren) {
  useApplyPreferences()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastRegion />
    </QueryClientProvider>
  )
}
