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
    <section className="px-0 py-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="page-header-title mt-2 text-[clamp(1.65rem,5vw,2.125rem)] font-semibold leading-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-tertiary)] sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0 self-start lg:self-end">{actions}</div> : null}
      </div>
    </section>
  )
}
