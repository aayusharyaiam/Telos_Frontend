import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { updateMe } from '../../api/auth.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

export default function SettingsPage() {
  const { appUser, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '' })

  const startEditing = () => {
    setForm({
      name: appUser?.name || '',
      email: appUser?.email || '',
      phone: appUser?.phone || '',
      department: appUser?.department || '',
    })
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Valid email is required'); return }

    setSaving(true)
    try {
      await updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        department: form.department.trim() || null,
      })
      await refreshUser()
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!appUser) {
    return (
      <AppShell>
        <SkeletonPage rows={3} statCards={0} />
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
                className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary hover:scale-[1.02]"
              >
                Edit Profile
              </button>
            )
          }
        />

        {editing ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSave} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
              <p className="mb-4 font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Edit Profile</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block font-label-bold text-label-bold uppercase tracking-wider text-ink-600 dark:text-outline">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label-bold text-label-bold uppercase tracking-wider text-ink-600 dark:text-outline">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label-bold text-label-bold uppercase tracking-wider text-ink-600 dark:text-outline">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-label-bold text-label-bold uppercase tracking-wider text-ink-600 dark:text-outline">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-6 py-2.5 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface shadow-sm hover:bg-ink-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
              <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
                <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Account Information</p>
              </div>
              <div className="divide-y divide-sand-200/30 dark:divide-outline/10 px-6 py-4">
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Name</span>
                  <span className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{appUser.name}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Email</span>
                  <span className="font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface">{appUser.email}</span>
                </div>
                {appUser.notificationEmail && (
                  <div className="flex items-center justify-between py-3">
                    <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Notification Email</span>
                    <span className="font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface">{appUser.notificationEmail}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Phone</span>
                  <span className="font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface">{appUser.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Role</span>
                  <Badge tone="indigo">{appUser.role}</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Department</span>
                  <span className="font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface">{appUser.department || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-body-md text-body-md text-ink-500 dark:text-outline">Account Status</span>
                  <Badge tone={appUser.isActive !== false ? 'emerald' : 'red'}>
                    {appUser.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Preferences</p>
            <p className="mt-2 font-body-md text-body-md text-ink-500 dark:text-outline">
              Emails are sent to your login email unless an admin sets a separate notification email. Ask your admin to update it if needed.
            </p>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
