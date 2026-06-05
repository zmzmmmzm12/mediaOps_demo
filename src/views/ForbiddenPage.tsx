'use client'

import Link from 'next/link'
import { useI18n } from '../i18n'

export function ForbiddenPage() {
  const { t } = useI18n()

  return (
    <div className="surface-card px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">403</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
        {t('nav.forbidden')}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-tertiary)]">
        {t('campaigns.readonly')}
      </p>
      <Link
        href="/dashboard"
        className="focus-ring mt-6 inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--panel-muted)]"
      >
        {t('nav.dashboard')}
      </Link>
    </div>
  )
}
