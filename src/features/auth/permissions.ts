import type { UserRole } from '../../types/mediaops'
import { roleTextMap } from '../../lib/labels'

export type Permission =
  | "dashboard:view"
  | "campaigns:view"
  | "campaigns:edit"
  | "reports:view"
  | "settings:view"
  | "settings:manage-users";

export interface MenuEntry {
  to: string;
  label: string;
  description: string;
  permission: Permission;
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "dashboard:view",
    "campaigns:view",
    "campaigns:edit",
    "reports:view",
    "settings:view",
    "settings:manage-users",
  ],
  manager: [
    "dashboard:view",
    "campaigns:view",
    "campaigns:edit",
    "reports:view",
    "settings:view",
  ],
  viewer: ["dashboard:view", "campaigns:view", "reports:view", "settings:view"],
};

export const menuEntries: MenuEntry[] = [
  {
    to: '/dashboard',
    label: '대시보드',
    description: '운영 현황 요약',
    permission: 'dashboard:view',
  },
  {
    to: '/campaigns',
    label: '캠페인',
    description: '검색, 필터, 상세 분석',
    permission: 'campaigns:view',
  },
  {
    to: '/reports',
    label: '리포트',
    description: '매출과 효율 분석',
    permission: 'reports:view',
  },
  {
    to: '/settings',
    label: '설정',
    description: '프로필과 개인화 설정',
    permission: 'settings:view',
  },
]

export const roleLabels: Record<UserRole, string> = roleTextMap

const validRoles = ['admin', 'manager', 'viewer'] as const

export function isUserRole(role: unknown): role is UserRole {
  return (
    typeof role === 'string' &&
    validRoles.includes(role as (typeof validRoles)[number])
  )
}

export function normalizeUserRole(role: unknown): UserRole | null {
  if (role === 'operator') {
    return 'manager'
  }

  return isUserRole(role) ? role : null
}

export function hasPermission(role: unknown, permission: Permission) {
  const normalizedRole = normalizeUserRole(role)

  if (!normalizedRole) {
    return false
  }

  return rolePermissions[normalizedRole].includes(permission)
}
