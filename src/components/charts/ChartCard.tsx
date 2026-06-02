import type { PropsWithChildren, ReactNode } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

interface ChartCardProps extends PropsWithChildren {
  title: string
  description?: string
  actions?: ReactNode
}

export function ChartCard({
  title,
  description,
  actions,
  children,
}: ChartCardProps) {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <article
      className={`rounded-[30px] border p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>{title}</p>
          {description ? (
            <p className={`mt-1 text-sm leading-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}
