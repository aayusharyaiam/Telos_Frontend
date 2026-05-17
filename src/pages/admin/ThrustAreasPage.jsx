import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getThrustAreas, createThrustArea, updateThrustArea } from '../../api/admin.api'
import { SkeletonTableRow } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export default function ThrustAreasPage() {
  const [areas, setAreas] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setAreas(await getThrustAreas())
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load thrust areas')
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
      toast.success('Thrust area created')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not create thrust area')
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (area) => {
    try {
      await updateThrustArea(area.id, { isActive: !area.isActive })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update thrust area')
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Thrust Area Management"
          subtitle="Manage the thrust areas available for goal categorization."
        />

        {/* Create new */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block font-label-bold text-label-bold uppercase tracking-wider text-ink-600 dark:text-outline">
                New Thrust Area
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Digital Transformation"
                className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="rounded-xl bg-primary-container px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02] disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add'}
            </button>
          </form>
        </motion.div>

        {/* List */}
        {loading ? (
          <SkeletonTableRow rows={3} />
        ) : !areas.length ? (
          <EmptyState
            title="No thrust areas found"
            description="Seed default thrust areas or create custom ones above."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                Thrust Areas ({areas.length})
              </p>
            </div>
            <motion.div
              className="divide-y divide-sand-200/30 dark:divide-outline/10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {areas.map((area) => (
                <motion.div
                  key={area.id}
                  variants={itemVariants}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{area.name}</p>
                    <Badge tone={area.isDefault ? 'indigo' : 'slate'}>
                      {area.isDefault ? 'Default' : 'Custom'}
                    </Badge>
                    <Badge tone={area.isActive ? 'emerald' : 'red'}>
                      {area.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleToggle(area)}
                    className="font-body-md text-body-md font-semibold text-primary dark:text-primary-fixed-dim transition hover:text-primary-900"
                  >
                    {area.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
