import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getCycles, getActiveCycle, updateCycleWindow, archiveCycle } from '../../api/cycles.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import ConfirmModal from '../../components/shared/ConfirmModal'

const phaseLabels = {
  GOAL_SETTING: 'Goal Setting',
  Q1_CHECKIN: 'Q1 Check-in',
  Q2_CHECKIN: 'Q2 Check-in',
  Q3_CHECKIN: 'Q3 Check-in',
  Q4_CHECKIN: 'Q4 Check-in',
}

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

export default function CycleConfigPage() {
  const [cycles, setCycles] = useState([])
  const [activeCycle, setActiveCycle] = useState(null)
  const [pendingWindowChange, setPendingWindowChange] = useState(null)
  const [pendingArchive, setPendingArchive] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  async function loadData() {
    try {
      const [allCycles, active] = await Promise.all([
        getCycles(showArchived),
        getActiveCycle(),
      ])
      setCycles(allCycles)
      setActiveCycle(active)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load cycles')
    }
  }

  useEffect(() => {
    loadData()
  }, [showArchived])

  const setWindowStatus = async () => {
    if (!pendingWindowChange) return
    setSaving(true)
    try {
      await updateCycleWindow(pendingWindowChange.cycleId, pendingWindowChange.window.phase, pendingWindowChange.status)
      setPendingWindowChange(null)
      await loadData()
      toast.success('Window updated')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update cycle window')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!pendingArchive) return
    setSaving(true)
    try {
      await archiveCycle(pendingArchive.id)
      setPendingArchive(null)
      await loadData()
      toast.success('Cycle archived')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not archive cycle')
    } finally {
      setSaving(false)
    }
  }

  const active = cycles.find(c => c.isActive) || activeCycle
  const inactiveCycles = cycles.filter(c => !c.isActive && !c.isArchived)
  const archivedCycles = cycles.filter(c => c.isArchived)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Cycle Configuration"
          subtitle="Force-open or close windows, archive past cycles."
        />

        <ConfirmModal
          open={Boolean(pendingWindowChange)}
          title="Update Cycle Window"
          message={
            pendingWindowChange
              ? `Are you sure you want to ${pendingWindowChange.status === 'FORCE_OPEN' ? 'force open' : 'force close'} ${phaseLabels[pendingWindowChange.window.phase] || pendingWindowChange.window.phase}?`
              : ''
          }
          confirmLabel={pendingWindowChange?.status === 'FORCE_OPEN' ? 'Force Open' : 'Force Close'}
          tone={pendingWindowChange?.status === 'FORCE_OPEN' ? 'primary' : 'warning'}
          onConfirm={setWindowStatus}
          onCancel={() => setPendingWindowChange(null)}
          loading={saving}
        />

        <ConfirmModal
          open={Boolean(pendingArchive)}
          title="Archive Cycle"
          message={pendingArchive ? `Archive "${pendingArchive.name}"? It will be hidden from all views.` : ''}
          confirmLabel="Archive"
          tone="warning"
          onConfirm={handleArchive}
          onCancel={() => setPendingArchive(null)}
          loading={saving}
        />

        {/* Active Cycle Windows */}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-sand-200/50 dark:border-outline/20 px-4 sm:px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{active.name} Windows</p>
              <Badge tone="emerald">Active</Badge>
            </div>
            <motion.div
              className="divide-y divide-sand-200/30 dark:divide-outline/10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {(active.windows || []).map((window) => (
                <motion.div
                  key={window.phase}
                  variants={itemVariants}
                  className="grid gap-3 sm:gap-4 px-4 sm:px-6 py-4 grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <div>
                    <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{phaseLabels[window.phase] || window.phase}</p>
                    <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                      {window.opensAt.slice(0, 10)} - {window.closesAt.slice(0, 10)}
                    </p>
                  </div>
                  <div>
                    <Badge tone={window.status === 'OPEN' || window.status === 'FORCE_OPEN' ? 'emerald' : 'slate'}>
                      {window.status}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setPendingWindowChange({ cycleId: active.id, window, status: 'FORCE_OPEN' })}
                    className="text-left font-body-md text-body-md font-semibold text-primary dark:text-primary-fixed-dim"
                  >
                    Force Open
                  </button>
                  <button
                    onClick={() => setPendingWindowChange({ cycleId: active.id, window, status: 'FORCE_CLOSED' })}
                    className="text-left font-body-md text-body-md font-semibold text-ink-600 dark:text-outline"
                  >
                    Force Close
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Inactive Cycles */}
        {inactiveCycles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Past Cycles ({inactiveCycles.length})</p>
            </div>
            <motion.div
              className="divide-y divide-sand-200/30 dark:divide-outline/10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {inactiveCycles.map((c) => (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{c.name}</p>
                  <button
                    onClick={() => setPendingArchive(c)}
                    className="font-body-md text-body-md font-semibold text-ink-500 dark:text-outline hover:text-red-600"
                  >
                    Archive
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Archived Cycles */}
        {archivedCycles.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="font-body-md text-body-md font-semibold text-ink-500 dark:text-outline"
            >
              {showArchived ? 'Hide' : 'Show'} archived cycles ({archivedCycles.length})
            </button>
            {showArchived && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-white/60 dark:bg-dark-surface/50 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
              >
                <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
                  <p className="font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">Archived Cycles</p>
                </div>
                <motion.div
                  className="divide-y divide-sand-200/30 dark:divide-outline/10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {archivedCycles.map((c) => (
                    <motion.div
                      key={c.id}
                      variants={itemVariants}
                      className="px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                    >
                      <p className="font-body-md text-body-md text-ink-600 dark:text-outline">{c.name}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
