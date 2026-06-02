import { StatusBadge } from '../ui/StatusBadge'

interface MetricCardProps {
  label: string
  value: string
  delta: string
  tone: 'positive' | 'warning' | 'neutral'
}

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3">
        <StatusBadge label={delta} tone={tone} />
      </div>
    </article>
  )
}
