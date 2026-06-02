import { Link, useLocation } from 'react-router-dom'
import { usePreferencesStore } from '../../features/ui/preferences-store'

const labelMap: Record<string, string> = {
  dashboard: '대시보드',
  campaigns: '캠페인',
  reports: '리포트',
  settings: '설정',
  forbidden: '접근 제한',
}

export function Breadcrumbs() {
  const location = useLocation()
  const theme = usePreferencesStore((state) => state.theme)
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="경로" className={`flex flex-wrap items-center gap-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
      <Link to="/dashboard" className={theme === 'dark' ? 'hover:text-slate-100' : 'hover:text-slate-900'}>
        홈
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = labelMap[segment] ?? decodeURIComponent(segment)

        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            {isLast ? (
              <span className={`font-medium ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{label}</span>
            ) : (
              <Link to={href} className={theme === 'dark' ? 'hover:text-slate-100' : 'hover:text-slate-900'}>
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
