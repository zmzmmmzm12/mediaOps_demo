import type { ReactNode } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

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
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <div
      className={`rounded-[32px] border p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:flex sm:items-end sm:justify-between sm:p-8 ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div>
        {eyebrow ? (
          <p
            className={`text-xs font-semibold tracking-[0.28em] ${
              theme === 'dark' ? 'text-teal-300' : 'text-teal-700'
            }`}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description ? (
          <p
            className={`mt-3 max-w-3xl text-sm leading-6 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
