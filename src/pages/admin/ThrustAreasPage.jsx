import { useEffect, useState } from 'react'
import { getThrustAreas, createThrustArea, updateThrustArea } from '../../api/admin.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

export default function ThrustAreasPage() {
  const [areas, setAreas] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setAreas(await getThrustAreas())
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load thrust areas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      setCreating(true)
      await createThrustArea(newName.trim())
      setNewName('')
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not create thrust area')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (area) => {
    try {
      await updateThrustArea(area.id, { isActive: !area.isActive })
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update thrust area')
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Thrust Area Management"
          subtitle="Manage the thrust areas available for goal categorization."
        />

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Create new */}
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-600">
              New Thrust Area
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Digital Transformation"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            {creating ? 'Adding...' : 'Add'}
          </button>
        </form>

        {/* List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-ink-500">Loading...</div>
        ) : !areas.length ? (
          <EmptyState
            title="No thrust areas found"
            description="Seed default thrust areas or create custom ones above."
          />
        ) : (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">
                Thrust Areas ({areas.length})
              </p>
            </div>
            <div className="divide-y divide-ink-100">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-ink-900">{area.name}</p>
                    <Badge tone={area.isDefault ? 'indigo' : 'slate'}>
                      {area.isDefault ? 'Default' : 'Custom'}
                    </Badge>
                    <Badge tone={area.isActive ? 'emerald' : 'red'}>
                      {area.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleToggle(area)}
                    className="text-sm font-semibold text-primary-700 transition hover:text-primary-900"
                  >
                    {area.isActive ? 'Deactivate' : 'Reactivate'}
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
