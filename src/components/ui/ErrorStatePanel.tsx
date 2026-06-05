'use client'

import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'

interface ErrorStatePanelProps {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorStatePanel({
  title,
  message,
  action,
}: ErrorStatePanelProps) {
  const { t } = useI18n()

  return (
    <div
      role="alert"
      className="surface-card border-[color:var(--danger-soft)] bg-[color:var(--danger-soft)] px-5 py-10 text-center"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--danger-soft)] bg-[var(--panel-strong)] text-[var(--danger)]">
        !
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--danger)]">{t('common.error')}</p>
      <h3 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{title ?? t('common.error')}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
