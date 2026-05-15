import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const users = [
  { id: 'u1', name: 'Arjun Sharma', role: 'EMPLOYEE', manager: 'Priya Menon', active: true },
  { id: 'u2', name: 'Priya Menon', role: 'MANAGER', manager: 'Rahul Gupta', active: true },
  { id: 'u3', name: 'Rahul Gupta', role: 'ADMIN', manager: '-', active: true },
]

export default function UserManagementPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="User Management"
          subtitle="Manage roles, reporting lines, and user activation states."
          actions={
            <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              Add User
            </button>
          }
        />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Users</p>
          </div>
          <div className="divide-y divide-ink-100">
            {users.map((user) => (
              <div key={user.id} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-500">Reports to {user.manager}</p>
                </div>
                <div>
                  <Badge tone="indigo">{user.role}</Badge>
                </div>
                <div>
                  <Badge tone={user.active ? 'emerald' : 'red'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <button className="text-left text-sm font-semibold text-primary-700">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
