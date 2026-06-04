import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="surface-card border-dashed px-6 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-quaternary)]">
        빈 상태
      </p>
      <h3 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-tertiary)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
