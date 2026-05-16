import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { updateMe } from '../../api/auth.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

export default function SettingsPage() {
  const { appUser, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '' })

  const startEditing = () => {
    setForm({
      name: appUser?.name || '',
      email: appUser?.email || '',
      phone: appUser?.phone || '',
      department: appUser?.department || '',
    })
    setError('')
    setSuccess('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Valid email is required'); return }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        department: form.department.trim() || null,
      })
      await refreshUser()
      setSuccess('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

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
        <PageHeader
          title="Profile & Settings"
          subtitle="View and edit your account details."
          actions={
            !editing && (
              <button
                onClick={startEditing}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Edit Profile
              </button>
            )
          }
        />

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

        {editing ? (
          <form onSubmit={handleSave} className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="mb-4 text-sm font-semibold text-ink-900">Edit Profile</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-ink-200 bg-white px-6 py-2.5 text-sm font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
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
                <span className="text-sm text-ink-500">Phone</span>
                <span className="text-sm text-ink-900">{appUser.phone || '—'}</span>
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
        )}

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <p className="text-sm font-semibold text-ink-900">Preferences</p>
          <p className="mt-2 text-sm text-ink-500">
            Keep your email up to date to receive email notifications for check-in reminders and goal updates.
          </p>
        </div>
      </div>
    </AppShell>
  )
}