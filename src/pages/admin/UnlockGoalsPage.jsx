import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getTeamGoalSheets, unlockGoalSheet, unlockGoal } from '../../api/goalSheets.api'
import { SkeletonPage, SkeletonTableRow } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

const STATUS_TONES = {
  DRAFT: 'slate',
  SUBMITTED: 'amber',
  APPROVED: 'emerald',
  RETURNED: 'red',
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

export default function UnlockGoalsPage() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Sheet-level unlock
  const [unlockTarget, setUnlockTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  // Goal-level unlock
  const [goalUnlockTarget, setGoalUnlockTarget] = useState(null)
  const [goalReason, setGoalReason] = useState('')
  const [goalUnlocking, setGoalUnlocking] = useState(false)

  // Expanded sheet to show individual goals
  const [expandedSheetId, setExpandedSheetId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      setSheets(await getTeamGoalSheets())
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load goal sheets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = sheets.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    )
  })

  const handleUnlock = async () => {
    if (!unlockTarget || reason.length < 5) return
    try {
      setUnlocking(true)
      await unlockGoalSheet(unlockTarget.id, reason)
      setUnlockTarget(null)
      setReason('')
      await load()
      toast.success('Goal sheet unlocked')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to unlock')
    } finally {
      setUnlocking(false)
    }
  }

  const handleGoalUnlock = async () => {
    if (!goalUnlockTarget || goalReason.length < 5) return
    try {
      setGoalUnlocking(true)
      await unlockGoal(goalUnlockTarget.id, goalReason)
      setGoalUnlockTarget(null)
      setGoalReason('')
      await load()
      toast.success('Goal unlocked')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to unlock goal')
    } finally {
      setGoalUnlocking(false)
    }
  }

  const toggleExpanded = (sheetId) => {
    setExpandedSheetId((prev) => (prev === sheetId ? null : sheetId))
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Goal Sheet Unlock"
          subtitle="Unlock approved/locked goal sheets or individual goals for employees to edit and resubmit."
        />

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee name or email..."
          className="w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />

        {/* Sheet Unlock Modal */}
        {unlockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-5 sm:p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-inverse-on-surface">
                Unlock Goal Sheet
              </h3>
              <p className="mt-1 font-body-md text-body-md text-ink-600 dark:text-outline">
                Unlocking <strong>{unlockTarget.user?.name}</strong>&apos;s goal sheet.
                This will set the sheet to RETURNED and unlock all goals.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter unlock reason (min 5 chars)..."
                rows={3}
                className="mt-4 w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => { setUnlockTarget(null); setReason('') }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface transition hover:bg-sand-100 dark:hover:bg-dark-bg/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking || reason.length < 5}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {unlocking ? 'Unlocking...' : 'Confirm Unlock'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Unlock Modal */}
        {goalUnlockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-5 sm:p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-inverse-on-surface">
                Unlock Individual Goal
              </h3>
              <p className="mt-1 font-body-md text-body-md text-ink-600 dark:text-outline">
                Unlocking goal: <strong>{goalUnlockTarget.title}</strong>
              </p>
              <textarea
                value={goalReason}
                onChange={(e) => setGoalReason(e.target.value)}
                placeholder="Enter unlock reason (min 5 chars)..."
                rows={3}
                className="mt-4 w-full rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => { setGoalUnlockTarget(null); setGoalReason('') }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface transition hover:bg-sand-100 dark:hover:bg-dark-bg/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUnlock}
                  disabled={goalUnlocking || goalReason.length < 5}
                  className="rounded-xl bg-primary-container px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02] disabled:opacity-50"
                >
                  {goalUnlocking ? 'Unlocking...' : 'Unlock Goal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sheets List */}
        {loading ? (
          <SkeletonTableRow rows={3} />
        ) : !filtered.length ? (
          <EmptyState
            title={search ? 'No matching sheets' : 'No goal sheets found'}
            description={search ? 'Try a different search term.' : 'Goal sheets will appear once employees create them.'}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                Goal Sheets ({filtered.length})
              </p>
            </div>
            <motion.div
              className="divide-y divide-sand-200/30 dark:divide-outline/10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((sheet) => (
                <div key={sheet.id}>
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                          {sheet.user?.name}
                        </p>
                        <Badge tone={STATUS_TONES[sheet.status] || 'slate'}>
                          {sheet.status}
                        </Badge>
                      </div>
                      <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                        {sheet.user?.email} · {sheet.goals?.length || 0} goals
                        {sheet.status === 'APPROVED' && ' · Locked'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sheet.status === 'APPROVED' && sheet.goals?.some((g) => g.isLocked) && (
                        <button
                          onClick={() => toggleExpanded(sheet.id)}
                          className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-1.5 text-xs font-semibold text-ink-700 dark:text-inverse-on-surface transition hover:bg-sand-100 dark:hover:bg-dark-bg/30"
                        >
                          {expandedSheetId === sheet.id ? 'Hide Goals' : 'Per-Goal Unlock'}
                        </button>
                      )}
                      {sheet.status === 'APPROVED' && (
                        <button
                          onClick={() => setUnlockTarget(sheet)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
                        >
                          🔓 Unlock All
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Per-goal unlock detail */}
                  {expandedSheetId === sheet.id && sheet.goals?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-sand-200/50 dark:border-outline/20 bg-sand-50 dark:bg-dark-bg px-6 py-3"
                    >
                      <p className="font-label-bold text-label-bold text-ink-600 dark:text-outline mb-2">Individual Goals</p>
                      <div className="space-y-2">
                        {sheet.goals.map((goal) => (
                          <div key={goal.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 ring-1 ring-ink-100/10 dark:ring-outline/20 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                                {goal.isShared && <Badge tone="indigo">Shared</Badge>}
                                <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>
                                  {goal.isLocked ? 'Locked' : 'Unlocked'}
                                </Badge>
                              </div>
                              <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">{goal.thrustArea} · Weightage: {goal.weightage}%</p>
                            </div>
                            {goal.isLocked && (
                              <button
                                onClick={() => setGoalUnlockTarget(goal)}
                                className="rounded-xl bg-primary-container px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02]"
                              >
                                🔓 Unlock
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
