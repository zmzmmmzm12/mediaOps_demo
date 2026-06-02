import type { PropsWithChildren, ReactNode } from 'react'

interface ChartCardProps extends PropsWithChildren {
  title: string
  description?: string
  actions?: ReactNode
}

export function ChartCard({
  title,
  description,
  actions,
  children,
}: ChartCardProps) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}
