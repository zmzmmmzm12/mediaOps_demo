import { Skeleton } from './Skeleton'

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="surface-card p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-5 h-11 w-2/3" />
        <Skeleton className="mt-4 h-4 w-1/2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`metric-skeleton-${index}`} className="surface-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-6 h-8 w-24" />
            <Skeleton className="mt-5 h-6 w-24" />
          </div>
        ))}
      </div>
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="surface-card p-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-3 h-4 w-56" />
          <Skeleton className="mt-6 h-[280px] w-full rounded-xl" />
        </div>
        <div className="surface-card p-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-3 h-4 w-40" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`activity-skeleton-${index}`} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
