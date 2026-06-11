'use client'

import Link from 'next/link'
import { useI18n } from '../i18n'

export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="surface-card border-dashed px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-quaternary)]">404</p>
      <h2 className="mt-4 text-[clamp(2rem,7vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
        {t('nav.notFound')}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-tertiary)]">
        {t('dashboard.description')}
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
