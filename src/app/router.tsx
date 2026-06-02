/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { PageSkeleton } from '../components/ui/PageSkeleton'
import { useAuthStore } from '../features/auth/auth-store'
import { hasPermission, type Permission } from '../features/auth/permissions'

const LoginPage = lazy(async () => ({
  default: (await import('../pages/LoginPage')).LoginPage,
}))
const DashboardPage = lazy(async () => ({
  default: (await import('../pages/DashboardPage')).DashboardPage,
}))
const CampaignsPage = lazy(async () => ({
  default: (await import('../pages/CampaignsPage')).CampaignsPage,
}))
const CampaignDetailPage = lazy(async () => ({
  default: (await import('../pages/CampaignDetailPage')).CampaignDetailPage,
}))
const ReportsPage = lazy(async () => ({
  default: (await import('../pages/ReportsPage')).ReportsPage,
}))
const SettingsPage = lazy(async () => ({
  default: (await import('../pages/SettingsPage')).SettingsPage,
}))
const ForbiddenPage = lazy(async () => ({
  default: (await import('../pages/ForbiddenPage')).ForbiddenPage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('../pages/NotFoundPage')).NotFoundPage,
}))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
}

function RequireAuth() {
  const session = useAuthStore((state) => state.session)

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function PublicOnly() {
  const session = useAuthStore((state) => state.session)

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

function RequirePermission({ permission }: { permission: Permission }) {
  const session = useAuthStore((state) => state.session)

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!hasPermission(session.role, permission)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      {
        path: '/login',
        element: withSuspense(<LoginPage />),
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: withSuspense(<DashboardPage />),
          },
          {
            element: <RequirePermission permission="campaigns:view" />,
            children: [
              {
                path: 'campaigns',
                element: withSuspense(<CampaignsPage />),
              },
              {
                path: 'campaigns/:campaignId',
                element: withSuspense(<CampaignDetailPage />),
              },
            ],
          },
          {
            element: <RequirePermission permission="reports:view" />,
            children: [
              {
                path: 'reports',
                element: withSuspense(<ReportsPage />),
              },
            ],
          },
          {
            element: <RequirePermission permission="settings:view" />,
            children: [
              {
                path: 'settings',
                element: withSuspense(<SettingsPage />),
              },
            ],
          },
          {
            path: 'forbidden',
            element: withSuspense(<ForbiddenPage />),
          },
          {
            path: '*',
            element: withSuspense(<NotFoundPage />),
          },
        ],
      },
    ],
  },
])
