import { StatusBadge } from '../ui/StatusBadge'
import { usePreferencesStore } from '../../features/ui/preferences-store'

interface MetricCardProps {
  label: string
  value: string
  delta: string
  tone: 'positive' | 'warning' | 'neutral'
}

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <article
      className={`rounded-[28px] border p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{value}</p>
      <div className="mt-3">
        <StatusBadge label={delta} tone={tone} />
      </div>
    </article>
  )
}
