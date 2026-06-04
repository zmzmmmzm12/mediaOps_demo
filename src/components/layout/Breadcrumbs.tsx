'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const labelMap: Record<string, string> = {
  dashboard: '대시보드',
  campaigns: '캠페인',
  reports: '리포트',
  settings: '설정',
  forbidden: '접근 제한',
  login: '로그인',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="경로" className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-tertiary)]">
      <Link href="/dashboard" className="focus-ring rounded-md hover:text-[var(--text-primary)]">
        홈
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = labelMap[segment] ?? decodeURIComponent(segment)

        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-[var(--text-quaternary)]">/</span>
            {isLast ? (
              <span className="font-medium text-[var(--text-primary)]">{label}</span>
            ) : (
              <Link href={href} className="focus-ring rounded-md hover:text-[var(--text-primary)]">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
