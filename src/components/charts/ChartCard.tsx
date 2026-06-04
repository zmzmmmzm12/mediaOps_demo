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
    <article className="surface-card overflow-hidden rounded-[24px] px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-4 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--panel-muted)]/60 p-4">
        {children}
      </div>
    </article>
  )
}
