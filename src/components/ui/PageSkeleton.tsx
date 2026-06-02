import { Skeleton } from './Skeleton'
import { usePreferencesStore } from '../../features/ui/preferences-store'

export function PageSkeleton() {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className={`rounded-[28px] p-6 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
        <Skeleton className={`h-4 w-24 ${theme === 'dark' ? 'bg-slate-800' : ''}`} />
        <Skeleton className={`mt-5 h-12 w-3/4 ${theme === 'dark' ? 'bg-slate-800' : ''}`} />
        <Skeleton className={`mt-4 h-4 w-2/3 ${theme === 'dark' ? 'bg-slate-800' : ''}`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`metric-skeleton-${index}`}
            className={`rounded-[24px] border p-5 ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-white'
            }`}
          >
            <Skeleton className={theme === 'dark' ? 'h-4 w-24 bg-slate-800' : 'h-4 w-24'} />
            <Skeleton className={theme === 'dark' ? 'mt-3 h-8 w-20 bg-slate-800' : 'mt-3 h-8 w-20'} />
            <Skeleton className={theme === 'dark' ? 'mt-4 h-6 w-28 bg-slate-800' : 'mt-4 h-6 w-28'} />
          </div>
        ))}
      </div>
    </div>
  )
}
