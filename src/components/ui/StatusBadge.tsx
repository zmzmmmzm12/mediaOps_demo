import { usePreferencesStore } from '../../features/ui/preferences-store'

interface StatusBadgeProps {
  label: string
  tone?: 'positive' | 'warning' | 'neutral'
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: StatusBadgeProps) {
  const theme = usePreferencesStore((state) => state.theme)
  const toneClassMap: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
    positive:
      theme === 'dark'
        ? 'bg-emerald-950/50 text-emerald-200 ring-emerald-900'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning:
      theme === 'dark'
        ? 'bg-amber-950/50 text-amber-200 ring-amber-900'
        : 'bg-amber-50 text-amber-800 ring-amber-200',
    neutral:
      theme === 'dark'
        ? 'bg-slate-800 text-slate-300 ring-slate-700'
        : 'bg-slate-50 text-slate-700 ring-slate-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  )
}
