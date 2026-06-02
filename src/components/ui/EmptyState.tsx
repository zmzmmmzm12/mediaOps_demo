import type { ReactNode } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

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
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <div
      className={`rounded-[30px] border px-6 py-12 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${
        theme === 'dark'
          ? 'border-dashed border-slate-800 bg-slate-900'
          : 'border-dashed border-slate-300 bg-white'
      }`}
    >
      <p className={`text-xs font-semibold tracking-[0.24em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>빈 상태</p>
      <h3 className={`mt-4 text-2xl font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{title}</h3>
      <p className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
