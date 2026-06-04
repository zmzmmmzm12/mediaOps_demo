import type { ReactNode } from 'react'

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
  return (
    <div
      role="alert"
      className="surface-card border-[color:var(--danger-soft)] bg-[color:var(--danger-soft)] px-6 py-12 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">오류</p>
      <h3 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
