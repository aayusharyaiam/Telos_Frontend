import useAuth from '../../hooks/useAuth'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

export default function SettingsPage() {
  const { appUser } = useAuth()

  if (!appUser) {
    return (
      <AppShell>
        <p className="text-sm text-ink-600">Loading profile...</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader title="Profile &amp; Settings" subtitle="View your account details and preferences." />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Account Information</p>
          </div>
          <div className="divide-y divide-ink-100 px-6 py-4">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-ink-500">Name</span>
              <span className="text-sm font-semibold text-ink-900">{appUser.name}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-ink-500">Email</span>
              <span className="text-sm text-ink-900">{appUser.email}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-ink-500">Role</span>
              <Badge tone="indigo">{appUser.role}</Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-ink-500">Department</span>
              <span className="text-sm text-ink-900">{appUser.department || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-ink-500">Account Status</span>
              <Badge tone={appUser.isActive !== false ? 'emerald' : 'red'}>
                {appUser.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <p className="text-sm font-semibold text-ink-900">Preferences</p>
          <p className="mt-2 text-sm text-ink-500">
            Additional preferences such as notification frequency and theme selection will be available in a future update.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
