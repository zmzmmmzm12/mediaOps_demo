import type { ReactNode } from 'react'
import { usePreferencesStore } from '../../features/ui/preferences-store'

interface ErrorStatePanelProps {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorStatePanel({
  title = '문제가 발생했습니다',
  message,
  action,
}: ErrorStatePanelProps) {
  const theme = usePreferencesStore((state) => state.theme)

  return (
    <div
      role="alert"
      className={`rounded-[30px] border px-6 py-12 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)] ${
        theme === 'dark'
          ? 'border-red-900/60 bg-red-950/30'
          : 'border-red-200 bg-red-50/90'
      }`}
    >
      <p className={`text-xs font-semibold tracking-[0.24em] ${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>오류</p>
      <h3 className={`mt-4 text-2xl font-semibold ${theme === 'dark' ? 'text-red-100' : 'text-red-900'}`}>{title}</h3>
      <p className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${theme === 'dark' ? 'text-red-200/90' : 'text-red-700'}`}>{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
