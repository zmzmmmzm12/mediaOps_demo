'use client'

import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'

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
  const { t } = useI18n()

  return (
    <div className="surface-card border-dashed px-5 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-muted)] text-[var(--text-tertiary)]">
        —
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-quaternary)]">
        {t('common.empty')}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-tertiary)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
