import { startTransition } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../features/auth/auth-store'
import { usePreferencesStore } from '../../features/ui/preferences-store'
import { Breadcrumbs } from './Breadcrumbs'
import {
  hasPermission,
  menuEntries,
  roleLabels,
} from '../../features/auth/permissions'
import { Button } from '../ui/Button'

export function AppShell() {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed)
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar)
  const theme = usePreferencesStore((state) => state.theme)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!session) {
    return null
  }

  const filteredMenu = menuEntries.filter((entry) =>
    hasPermission(session.role, entry.permission),
  )

  function handleLogout() {
    clearSession()
    queryClient.clear()
    startTransition(() => navigate('/login', { replace: true }))
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_24%),linear-gradient(180deg,_#fffef9_0%,_#f5efe4_100%)] text-slate-900'}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside
          className={`flex shrink-0 flex-col rounded-[32px] border p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:p-6 ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/90'
              : 'border-white/70 bg-white/75'
          } ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-80'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/dashboard"
              className={`rounded-3xl px-5 py-4 ${
                theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-950 text-white'
              } ${sidebarCollapsed ? 'w-full' : ''}`}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-teal-200/90">
                MediaOps
              </p>
              {!sidebarCollapsed ? (
                <>
                  <h1 className="mt-3 font-display text-3xl leading-none">
                    Dashboard
                  </h1>
                  <p className="mt-3 max-w-48 text-sm text-slate-300">
                    Media, revenue, and campaign operations.
                  </p>
                </>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`rounded-full p-2 ${
                theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-white'
              }`}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {!sidebarCollapsed ? (
            <div
              className={`mt-6 rounded-3xl border p-4 ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-200 bg-[linear-gradient(135deg,_rgba(249,115,22,0.10),_rgba(15,118,110,0.08))]'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Signed in
              </p>
              <p className="mt-2 text-lg font-semibold">{session.name}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {session.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <span className={`rounded-full px-3 py-1 ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                  {roleLabels[session.role]}
                </span>
              </div>
            </div>
          ) : null}

          <nav className="mt-6 space-y-2" aria-label="Primary">
            {filteredMenu.map((entry) => (
              <NavLink
                key={entry.to}
                to={entry.to}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-200 ring-1 ring-slate-800 hover:bg-slate-800'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`
                }
              >
                <div>
                  <p className="font-semibold">{sidebarCollapsed ? entry.label.slice(0, 1) : entry.label}</p>
                  {!sidebarCollapsed ? (
                    <p className="text-sm text-slate-400">{entry.description}</p>
                  ) : null}
                </div>
                {!sidebarCollapsed ? <span className="text-lg">→</span> : null}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-4">
            <Button variant="secondary" onClick={toggleTheme} className="w-full">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
            <Button variant="secondary" onClick={handleLogout} className="w-full">
              Sign out
            </Button>
          </div>
        </aside>

        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div
            className={`min-h-full rounded-[32px] border p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6 ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900/90'
                : 'border-white/70 bg-white/80'
            }`}
          >
            <header className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Breadcrumbs />
                <p className="mt-2 text-sm text-slate-500">
                  {session.name} · {roleLabels[session.role]}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  {session.name.slice(0, 1)}
                </span>
                <span>{session.email}</span>
              </div>
            </header>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
