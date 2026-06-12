import { usePreferencesStore } from '../../features/ui/preferences-store'
import { cn } from '../../lib/cn'

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
        ? 'bg-emerald-950/60 text-emerald-200 ring-emerald-900/70'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning:
      theme === 'dark'
        ? 'bg-amber-950/60 text-amber-200 ring-amber-900/70'
        : 'bg-amber-50 text-amber-800 ring-amber-200',
    neutral:
      theme === 'dark'
        ? 'bg-slate-800 text-slate-300 ring-slate-700'
        : 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 whitespace-nowrap items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset',
        toneClassMap[tone],
      )}
    >
      {label}
    </span>
  )
}
