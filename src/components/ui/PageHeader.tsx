import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] bg-slate-950 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.28em] text-teal-200/90">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 font-display text-4xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm text-slate-300">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
