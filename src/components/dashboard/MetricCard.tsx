import { StatusBadge } from '../ui/StatusBadge'

interface MetricCardProps {
  label: string
  value: string
  delta: string
  tone: 'positive' | 'warning' | 'neutral'
}

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  const toneAccentClassMap = {
    positive: 'bg-emerald-500/12 text-emerald-600',
    warning: 'bg-amber-500/12 text-amber-600',
    neutral: 'bg-[var(--brand-soft)] text-[var(--brand)]',
  } as const

  return (
    <article className="surface-card relative min-h-[140px] overflow-hidden p-4">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{label}</p>
            <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              {value}
            </p>
          </div>
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneAccentClassMap[tone]}`}>
            <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <StatusBadge label={delta} tone={tone} />
          <div className="flex h-9 items-end gap-1.5 opacity-75" aria-hidden="true">
            <span className="w-1.5 rounded-full bg-[var(--brand-soft-strong)]" style={{ height: '35%' }} />
            <span className="w-1.5 rounded-full bg-[var(--brand-soft-strong)]" style={{ height: '62%' }} />
            <span className="w-1.5 rounded-full bg-[var(--brand)]" style={{ height: '82%' }} />
            <span className="w-1.5 rounded-full bg-[var(--brand-soft-strong)]" style={{ height: '54%' }} />
          </div>
        </div>
      </div>
    </article>
  )
}
