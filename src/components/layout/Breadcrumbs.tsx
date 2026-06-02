import { Link, useLocation } from 'react-router-dom'

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  campaigns: 'Campaigns',
  reports: 'Reports',
  settings: 'Settings',
  forbidden: 'Forbidden',
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link to="/dashboard" className="hover:text-slate-900">
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        const label = labelMap[segment] ?? decodeURIComponent(segment)

        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            {isLast ? (
              <span className="font-medium text-slate-900">{label}</span>
            ) : (
              <Link to={href} className="hover:text-slate-900">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
