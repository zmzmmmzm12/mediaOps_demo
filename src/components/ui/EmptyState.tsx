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
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Empty</p>
      <h3 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
