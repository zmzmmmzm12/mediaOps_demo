'use client'

import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../features/auth/auth-store'
import { usePreferencesStore } from '../../features/ui/preferences-store'
import { Breadcrumbs } from './Breadcrumbs'
import {
  hasPermission,
  menuEntries,
} from '../../features/auth/permissions'
import {
  buildCampaignSearchParams,
  defaultCampaignFilters,
} from '../../features/campaigns/url-state'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
import { localeOptions, useI18n } from '../../i18n'
import type { Locale } from '../../i18n/types'

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M3 3h6v6H3zM11 3h6v10h-6zM3 11h6v6H3z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CampaignIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4 5h12M4 10h12M4 15h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14.5" cy="15" r="1.5" fill="currentColor" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4 16V8m6 8V4m6 12v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M10 4.2a1 1 0 0 1 .96.72l.3.97a4.8 4.8 0 0 1 1.08.62l.95-.31a1 1 0 0 1 1.14.4l.9 1.55a1 1 0 0 1-.18 1.19l-.72.69c.04.24.07.48.07.73 0 .25-.03.49-.07.73l.72.69a1 1 0 0 1 .18 1.19l-.9 1.55a1 1 0 0 1-1.14.4l-.95-.31c-.33.25-.69.46-1.08.62l-.3.97a1 1 0 0 1-.96.72H8.98a1 1 0 0 1-.96-.72l-.3-.97a4.8 4.8 0 0 1-1.08-.62l-.95.31a1 1 0 0 1-1.14-.4l-.9-1.55a1 1 0 0 1 .18-1.19l.72-.69a4.72 4.72 0 0 1 0-1.46l-.72-.69a1 1 0 0 1-.18-1.19l.9-1.55a1 1 0 0 1 1.14-.4l.95.31c.33-.25.69-.46 1.08-.62l.3-.97A1 1 0 0 1 8.98 4.2H10Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9.99" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M10 3.5a3.5 3.5 0 0 0-3.5 3.5v1.14c0 .7-.2 1.39-.58 1.98L4.8 11.8A1 1 0 0 0 5.66 13h8.68a1 1 0 0 0 .85-1.52l-1.1-1.68a3.63 3.63 0 0 1-.59-1.98V7A3.5 3.5 0 0 0 10 3.5Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 15a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.45" />
      <path d="M3.8 8h12.4M3.8 12h12.4M10 3c1.85 1.9 2.8 4.23 2.8 7S11.85 15.1 10 17M10 3C8.15 4.9 7.2 7.23 7.2 10s.95 5.1 2.8 7" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="m10 2 1.7 4.3L16 8l-4.3 1.7L10 14l-1.7-4.3L4 8l4.3-1.7L10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M10 2.8v1.6M10 15.6v1.6M4.4 4.4l1.1 1.1M14.5 14.5l1.1 1.1M2.8 10h1.6M15.6 10h1.6M4.4 15.6l1.1-1.1M14.5 5.5l1.1-1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M15.8 12.4A6.5 6.5 0 0 1 7.6 4.2 6.5 6.5 0 1 0 15.8 12.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

const menuIconMap: Record<string, ReactNode> = {
  '/dashboard': <DashboardIcon />,
  '/campaigns': <CampaignIcon />,
  '/reports': <ReportsIcon />,
  '/settings': <SettingsIcon />,
}

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)
  const theme = usePreferencesStore((state) => state.theme)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const { locale, setLocale, t } = useI18n()
  const [headerSearch, setHeaderSearch] = useState('')
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const hydrated = useSyncExternalStore(
    (callback) => {
      const unsubscribeHydrate = useAuthStore.persist.onHydrate(callback)
      const unsubscribeFinishHydration = useAuthStore.persist.onFinishHydration(callback)
      return () => {
        unsubscribeHydrate()
        unsubscribeFinishHydration()
      }
    },
    () => useAuthStore.persist.hasHydrated(),
    () => true,
  )

  useEffect(() => {
    if (hydrated && !session) {
      router.replace('/login')
    }
  }, [hydrated, router, session])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const filteredMenu = useMemo(
    () => (session
      ? menuEntries.filter((entry) => hasPermission(session.role, entry.permission))
      : []),
    [session],
  )

  function handleLogout() {
    clearSession()
    queryClient.clear()
    router.replace('/login')
  }

  function handleHeaderSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = buildCampaignSearchParams({
      ...defaultCampaignFilters,
      search: headerSearch.trim(),
      page: 1,
    })

    router.push(`/campaigns?${query.toString()}`)
  }

  const currentLocaleOption = localeOptions.find((option) => option.value === locale) ?? localeOptions[0]

  if (!hydrated || !session) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6" data-theme={theme}>
        <div className="mx-auto max-w-6xl">
          <div className="surface-card h-32 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]" data-theme={theme}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--panel-strong)] focus:px-4 focus:py-2"
      >
        본문으로 건너뛰기
      </a>

      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-4 px-4 py-4 lg:grid-cols-[244px_minmax(0,1fr)] lg:px-5 lg:py-5">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] px-3 py-3 shadow-[0_14px_42px_rgba(15,23,42,0.06)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <Link href="/dashboard" className="focus-ring rounded-xl">
            <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                <DashboardIcon />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  MediaOps
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-[var(--sidebar-text)]">
                  {t('sidebar.title')}
                </p>
              </div>
            </div>
          </Link>

          <div className="mt-3 rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-panel)] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sidebar-panel-strong)] text-sm font-semibold text-[var(--brand)] shadow-sm">
                M
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--sidebar-text)]">{t('sidebar.team')}</p>
                <p className="truncate text-xs text-[var(--sidebar-muted)]">{t('nav.workspace')}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-panel-strong)] px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--sidebar-muted)]">{t('nav.role')}</span>
              <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-[11px] font-semibold text-white">
                {t(`labels.role.${session.role}`)}
              </span>
            </div>
          </div>

          <div className="mt-5 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-muted)]">
              {t('nav.menu')}
            </p>
          </div>

          <div className="scrollbar-subtle mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
            <nav className="space-y-1" aria-label={t('nav.menu')}>
              {filteredMenu.map((entry) => {
                const isActive = pathname === entry.to || pathname.startsWith(`${entry.to}/`)
                const navKey = entry.to.replace('/', '') || 'dashboard'

                return (
                  <Link
                    key={entry.to}
                    href={entry.to}
                    className={cn(
                      'focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5',
                      isActive
                        ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text)]'
                        : 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive ? (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                    ) : null}
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        isActive
                          ? 'bg-[var(--brand)] text-white shadow-sm'
                          : 'bg-transparent text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]',
                      )}
                      aria-hidden="true"
                    >
                      {menuIconMap[entry.to] ?? <DashboardIcon />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-current">{t(`nav.${navKey}`)}</p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="mt-3 shrink-0 border-t border-[var(--sidebar-border)] px-1 pt-3">
            <div className="mb-3 rounded-lg border border-[var(--sidebar-border)] bg-[var(--sidebar-panel)] px-3 py-3">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <SparkIcon />
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">{t('nav.workspace')}</p>
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--sidebar-text)]">{t('sidebar.workspaceTitle')}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--sidebar-muted)]">{t('sidebar.workspaceDesc')}</p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-1 w-full justify-start px-3 text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
              aria-label={t('nav.logout')}
            >
              <span>{t('nav.logout')}</span>
            </Button>
          </div>
        </aside>

        <main id="main-content" className="min-w-0 overflow-x-hidden" tabIndex={-1}>
          <div className="mx-auto flex min-h-full max-w-[1160px] flex-col gap-5 pb-8">
            <header className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel-bg)] px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.035)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Breadcrumbs />
                <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">
                  {t('header.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form
                  role="search"
                  onSubmit={handleHeaderSearchSubmit}
                  className="field-shell focus-within:focus-ring hidden h-9 min-h-9 items-center gap-2 px-3 text-sm text-[var(--text-tertiary)] md:flex md:min-w-[310px]"
                >
                  <label htmlFor="global-campaign-search" className="sr-only">{t('header.searchLabel')}</label>
                  <SearchIcon />
                  <input
                    id="global-campaign-search"
                    type="search"
                    value={headerSearch}
                    onChange={(event) => setHeaderSearch(event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    placeholder={t('header.searchPlaceholder')}
                    className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-quaternary)]"
                  />
                </form>
                <button
                  type="button"
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-tertiary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]"
                  aria-label={t('header.notifications')}
                >
                  <BellIcon />
                </button>
                <div ref={languageMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setLanguageMenuOpen((open) => !open)}
                    className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] px-3 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]"
                    aria-label={t('header.languageLabel')}
                    aria-haspopup="menu"
                    aria-expanded={languageMenuOpen}
                  >
                    <LanguageIcon />
                    <span>{currentLocaleOption.value.toUpperCase()}</span>
                  </button>
                  {languageMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-[120] mt-2 w-40 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-bg)] py-1 shadow-[var(--shadow-md)]"
                    >
                      {localeOptions.map((option) => {
                        const selected = option.value === locale

                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            onClick={() => {
                              setLocale(option.value as Locale)
                              setLanguageMenuOpen(false)
                            }}
                            className={cn(
                              'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition',
                              selected
                                ? 'bg-[var(--panel-muted)] font-semibold text-[var(--text-primary)]'
                                : 'text-[var(--text-tertiary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]',
                            )}
                          >
                            <span>{option.label}</span>
                            {selected ? <span className="text-xs text-[var(--brand)]">✓</span> : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--panel-strong)] text-[var(--text-tertiary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]"
                  aria-label={theme === 'dark' ? t('header.switchToLight') : t('header.switchToDark')}
                >
                  <ThemeIcon theme={theme} />
                </button>
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
