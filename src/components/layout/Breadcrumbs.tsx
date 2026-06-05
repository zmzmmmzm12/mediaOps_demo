'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '../../i18n'

export function Breadcrumbs() {
  const pathname = usePathname()
  const { t } = useI18n()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-tertiary)]">
      <Link href="/dashboard" className="focus-ring rounded-md hover:text-[var(--text-primary)]">
        {t('nav.dashboard')}
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = t(`nav.${segment}`)
        const displayLabel = label === `nav.${segment}` ? decodeURIComponent(segment) : label

        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-[var(--text-quaternary)]">/</span>
            {isLast ? (
              <span className="font-medium text-[var(--text-primary)]">{displayLabel}</span>
            ) : (
              <Link href={href} className="focus-ring rounded-md hover:text-[var(--text-primary)]">
                {displayLabel}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
