import type { ReactNode } from 'react'

interface ErrorStatePanelProps {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorStatePanel({
  title = 'Something went wrong',
  message,
  action,
}: ErrorStatePanelProps) {
  return (
    <div
      role="alert"
      className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-10 text-center"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-red-500">Error</p>
      <h3 className="mt-4 text-2xl font-semibold text-red-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm text-red-700">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
