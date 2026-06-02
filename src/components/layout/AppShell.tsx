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
  const menuIconMap: Record<string, string> = {
    '/dashboard': '◫',
    '/campaigns': '◩',
    '/reports': '▤',
    '/settings': '⌘',
  }

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
    <div
      className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-[#0f1724] text-slate-100'
          : 'bg-slate-100 text-slate-900'
      }`}
      data-theme={theme}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-800 focus:px-4 focus:py-2 focus:text-white"
      >
        본문으로 건너뛰기
      </a>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside
          className={`flex shrink-0 flex-col rounded-[32px] border p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:p-5 ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900/96'
              : 'border-slate-200 bg-white'
          } ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-[18.5rem]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/dashboard"
              className={`rounded-[28px] border px-4 py-4 ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800 text-slate-100'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              } ${sidebarCollapsed ? 'w-full' : ''}`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
                  theme === 'dark' ? 'text-teal-300' : 'text-teal-700'
                }`}
              >
                MediaOps
              </p>
              {!sidebarCollapsed ? (
                <>
                  <h1
                    className={`mt-3 text-[28px] font-semibold leading-none tracking-tight ${
                      theme === 'dark' ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    MediaOps
                  </h1>
                  <p
                    className={`mt-3 max-w-48 text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    광고 운영과 성과 확인을 한 흐름으로 정리했습니다.
                  </p>
                </>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          {!sidebarCollapsed ? (
            <div
              className={`mt-5 rounded-[28px] border px-4 py-4 ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800/60'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {session.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className={`truncate text-base font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{session.name}</p>
                  <p className={`truncate text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {session.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  현재 권한
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-100 ring-1 ring-slate-600' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
                  {roleLabels[session.role]}
                </span>
              </div>
            </div>
          ) : null}

          <nav className="mt-5 space-y-2" aria-label="주요 메뉴">
            {filteredMenu.map((entry) => (
              <NavLink
                key={entry.to}
                to={entry.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[24px] px-3 py-3 transition ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-900 text-white'
                      : theme === 'dark'
                        ? 'text-slate-200 hover:bg-slate-800/80'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-slate-700 text-white'
                            : 'bg-white/12 text-white'
                          : theme === 'dark'
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200'
                      }`}
                      aria-hidden="true"
                    >
                      {menuIconMap[entry.to] ?? '•'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-semibold ${
                          isActive
                            ? 'text-white'
                            : theme === 'dark'
                              ? 'text-slate-100'
                              : 'text-slate-900'
                        }`}
                      >
                        {sidebarCollapsed ? entry.label.slice(0, 1) : entry.label}
                      </p>
                      {!sidebarCollapsed ? (
                        <p
                          className={`text-sm ${
                            isActive
                              ? 'text-slate-300'
                              : theme === 'dark'
                                ? 'text-slate-400'
                                : 'text-slate-500'
                          }`}
                        >
                          {entry.description}
                        </p>
                      ) : null}
                    </div>
                    {!sidebarCollapsed ? (
                      <span className={`text-sm ${isActive ? 'text-slate-300' : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>↗</span>
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div
            className={`mt-auto grid gap-2 pt-5 ${
              sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            <Button
              variant="secondary"
              onClick={toggleTheme}
              className={`${sidebarCollapsed ? 'px-0' : ''}`}
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {sidebarCollapsed ? '◐' : theme === 'dark' ? '라이트' : '다크'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className={`${sidebarCollapsed ? 'px-0' : ''} ${sidebarCollapsed ? '' : 'col-span-1'}`}
              aria-label="로그아웃"
            >
              {sidebarCollapsed ? '↘' : '로그아웃'}
            </Button>
          </div>
        </aside>

        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div
            className={`min-h-full rounded-[32px] border p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6 ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-white'
            }`}
          >
            <header
              className={`mb-6 flex flex-col gap-4 rounded-[24px] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800/70'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div>
                <Breadcrumbs />
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {session.name} · {roleLabels[session.role]}
                </p>
              </div>
              <div className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold ${theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-900 text-white'}`}>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-white/10'}`}>
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
