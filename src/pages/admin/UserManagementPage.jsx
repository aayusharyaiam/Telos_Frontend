import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, importUsersCSV } from '../../api/users.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmModal from '../../components/shared/ConfirmModal'

const ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN']

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pendingActiveToggle, setPendingActiveToggle] = useState(null)
  const [updatingUserId, setUpdatingUserId] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'EMPLOYEE',
    reportingManagerId: '', department: '',
  })

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
    try {
      setUpdatingUserId(user.id)
      await updateUser(user.id, { role })
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update role')
    } finally {
      setUpdatingUserId('')
    }
  }

  const handleActiveToggle = async () => {
    if (!pendingActiveToggle) return
    try {
      setUpdatingUserId(pendingActiveToggle.id)
      await updateUser(pendingActiveToggle.id, { isActive: !pendingActiveToggle.isActive })
      setPendingActiveToggle(null)
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update user')
    } finally {
      setUpdatingUserId('')
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) return
    try {
      setCreating(true)
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        reportingManagerId: form.reportingManagerId || null,
        department: form.department.trim() || null,
      })
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', reportingManagerId: '', department: '' })
      setShowCreate(false)
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not create user')
    } finally {
      setCreating(false)
    }
  }

  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importingCsv, setImportingCsv] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleCsvImport = async (e) => {
    e.preventDefault()
    if (!csvText.trim()) return
    setImportingCsv(true)
    setImportResult(null)
    try {
      const result = await importUsersCSV(csvText)
      setImportResult(result)
      setCsvText('')
      await loadUsers()
    } catch (err) {
      setImportResult({ created: 0, errors: [{ error: err.response?.data?.error?.message || 'Import failed' }] })
    } finally {
      setImportingCsv(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setCsvText(event.target.result)
    reader.readAsText(file)
  }

  const managers = users.filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN')

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="User Management"
            subtitle="Manage roles, reporting lines, and user activation states."
          />
          <div className="mt-1 flex gap-3">
            <button
              onClick={() => { setShowCsvImport(!showCsvImport); setShowCreate(false) }}
              className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50"
            >
              {showCsvImport ? 'Cancel' : 'Import CSV'}
            </button>
            <button
              onClick={() => { setShowCreate(!showCreate); setShowCsvImport(false) }}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              {showCreate ? 'Cancel' : '+ New User'}
            </button>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <ConfirmModal
          open={Boolean(pendingActiveToggle)}
          title={pendingActiveToggle?.isActive ? 'Deactivate User' : 'Activate User'}
          message={
            pendingActiveToggle
              ? `Are you sure you want to ${pendingActiveToggle.isActive ? 'deactivate' : 'activate'} ${pendingActiveToggle.name}?`
              : ''
          }
          confirmLabel={pendingActiveToggle?.isActive ? 'Deactivate' : 'Activate'}
          tone={pendingActiveToggle?.isActive ? 'danger' : 'primary'}
          onConfirm={handleActiveToggle}
          onCancel={() => setPendingActiveToggle(null)}
          loading={Boolean(updatingUserId)}
        />

        {/* CSV Import */}
        {showCsvImport && (
          <form
            onSubmit={handleCsvImport}
            className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100"
          >
            <p className="mb-1 text-sm font-semibold text-ink-900">Bulk Import Users</p>
            <p className="mb-4 text-xs text-ink-500">
              Upload a .csv file or paste CSV text. Columns: name, email, password, role, department (role and department optional).
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-4 block w-full text-sm text-ink-600 file:mr-3 file:rounded-xl file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
            />
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={5}
              placeholder="Or paste CSV here...
name,email,password,role
John,john@example.com,pass123,EMPLOYEE"
              className="mb-4 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm"
            />
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={importingCsv || !csvText.trim()}
                className="rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
              >
                {importingCsv ? 'Importing...' : 'Import Users'}
              </button>
              {importResult && (
                <p className="text-sm text-ink-600">
                  {importResult.created} created
                  {importResult.errors?.length > 0 ? `, ${importResult.errors.length} errors` : ''}
                </p>
              )}
            </div>
            {importResult?.errors?.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto rounded-xl bg-red-50 px-4 py-3">
                {importResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-700">
                    Row {e.row || '?'}: {e.error}
                  </p>
                ))}
              </div>
            )}
          </form>
        )}

        {/* Create User Form */}
        {showCreate && (
          <form
            onSubmit={handleCreateSubmit}
            className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100"
          >
            <p className="mb-4 text-sm font-semibold text-ink-900">Create New User</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Reporting Manager
                </label>
                <select
                  value={form.reportingManagerId}
                  onChange={(e) => setForm({ ...form, reportingManagerId: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
                >
                  <option value="">None</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
                  Department
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        )}

        {/* Users List */}
        {!users.length ? (
          <EmptyState title="No users" description="Create users to get started." />
        ) : (
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
                    disabled={updatingUserId === user.id}
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
                    onClick={() => setPendingActiveToggle(user)}
                    disabled={updatingUserId === user.id}
                    className="text-left text-sm font-semibold text-primary-700 disabled:opacity-50"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
