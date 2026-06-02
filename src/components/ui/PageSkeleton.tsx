import { Skeleton } from './Skeleton'

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="rounded-[28px] bg-slate-950 p-6">
        <Skeleton className="h-4 w-24 bg-white/20" />
        <Skeleton className="mt-5 h-12 w-3/4 bg-white/20" />
        <Skeleton className="mt-4 h-4 w-2/3 bg-white/20" />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`metric-skeleton-${index}`}
            className="rounded-[24px] border border-slate-200 bg-white p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-4 h-6 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
