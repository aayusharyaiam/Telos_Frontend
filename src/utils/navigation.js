import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  DocumentChartBarIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  LockOpenIcon,
  ShareIcon,
  Squares2X2Icon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

export const NAV_LINKS = {
  EMPLOYEE: [
    { label: 'My Goals', to: '/goals', icon: ClipboardDocumentListIcon },
  ],
  MANAGER: [
    { label: 'Team Overview', to: '/manager/team', icon: UsersIcon },
    { label: 'Shared Goals', to: '/manager/shared-goals', icon: ShareIcon },
  ],
  ADMIN: [
    { label: 'Admin Overview', to: '/admin', icon: Squares2X2Icon },
    { label: 'Users', to: '/admin/users', icon: UsersIcon },
    { label: 'Shared Goals', to: '/manager/shared-goals', icon: ShareIcon },
    { label: 'Cycle Config', to: '/admin/cycles', icon: AdjustmentsHorizontalIcon },
    { label: 'Thrust Areas', to: '/admin/thrust-areas', icon: TagIcon },
    { label: 'Unlock Goals', to: '/admin/unlock', icon: LockOpenIcon },
    { label: 'Escalations', to: '/admin/escalations', icon: ExclamationTriangleIcon },
    { label: 'Completion', to: '/admin/completion', icon: ClipboardDocumentCheckIcon },
    { label: 'Email Logs', to: '/admin/email-logs', icon: EnvelopeIcon },
    { label: 'Audit Trail', to: '/admin/audit', icon: DocumentChartBarIcon },
    { label: 'Analytics', to: '/admin/analytics', icon: ArrowTrendingUpIcon },
  ],
}

export const SETTINGS_LINK = {
  label: 'Settings',
  to: '/settings',
  icon: CogIcon,
}
