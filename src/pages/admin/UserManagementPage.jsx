import { useEffect, useState } from 'react'
import { getUsers, updateUser } from '../../api/users.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  async function loadUsers() {
    try {
      setUsers(await getUsers())
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load users')
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (user, role) => {
    await updateUser(user.id, { role })
    await loadUsers()
  }

  const handleActiveToggle = async (user) => {
    await updateUser(user.id, { isActive: !user.isActive })
    await loadUsers()
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="User Management"
          subtitle="Manage roles, reporting lines, and user activation states."
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Users ({users.length})</p>
          </div>
          <div className="divide-y divide-ink-100">
            {users.map((user) => (
              <div key={user.id} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-500">
                    {user.email} | Reports to {user.reportingManager?.name || '-'}
                  </p>
                </div>
                <select
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
                  value={user.role}
                  onChange={(event) => handleRoleChange(user, event.target.value)}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div>
                  <Badge tone={user.isActive ? 'emerald' : 'red'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <button
                  onClick={() => handleActiveToggle(user)}
                  className="text-left text-sm font-semibold text-primary-700"
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
