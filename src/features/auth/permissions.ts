import type { UserRole } from '../../types/mediaops'

export type Permission =
  | 'dashboard:view'
  | 'campaigns:view'
  | 'campaigns:edit'
  | 'reports:view'
  | 'settings:view'
  | 'settings:manage-users'

export interface MenuEntry {
  to: string
  label: string
  description: string
  permission: Permission
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view',
    'campaigns:view',
    'campaigns:edit',
    'reports:view',
    'settings:view',
    'settings:manage-users',
  ],
  manager: [
    'dashboard:view',
    'campaigns:view',
    'campaigns:edit',
    'reports:view',
    'settings:view',
  ],
  viewer: ['dashboard:view', 'campaigns:view', 'reports:view', 'settings:view'],
}

export const menuEntries: MenuEntry[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    description: 'Operations pulse',
    permission: 'dashboard:view',
  },
  {
    to: '/campaigns',
    label: 'Campaigns',
    description: 'Delivery and details',
    permission: 'campaigns:view',
  },
  {
    to: '/reports',
    label: 'Reports',
    description: 'Revenue and ROAS views',
    permission: 'reports:view',
  },
  {
    to: '/settings',
    label: 'Settings',
    description: 'Profile and preferences',
    permission: 'settings:view',
  },
]

export const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
}

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission)
}
