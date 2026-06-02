interface StatusBadgeProps {
  label: string
  tone?: 'positive' | 'warning' | 'neutral'
}

const toneClassMap: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  positive: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  )
}
