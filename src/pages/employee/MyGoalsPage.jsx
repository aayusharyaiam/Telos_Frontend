import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createGoalSheet, getMyGoalSheet } from '../../api/goalSheets.api'
import { getActiveCycle } from '../../api/cycles.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import EmptyState from '../../components/shared/EmptyState'
import GoalCard from '../../components/goals/GoalCard'
import WeightageBar from '../../components/goals/WeightageBar'

const CHECKIN_PHASE_TO_QUARTER = {
  Q1_CHECKIN: 'Q1',
  Q2_CHECKIN: 'Q2',
  Q3_CHECKIN: 'Q3',
  Q4_CHECKIN: 'Q4',
}

function formatDeadline(value) {
  if (!value) return 'the deadline'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getOpenCheckinWindow(cycle) {
  const now = new Date()
  return cycle?.windows?.find((window) => {
    if (!CHECKIN_PHASE_TO_QUARTER[window.phase]) return false
    if (window.status === 'FORCE_OPEN') return true
    if (window.status === 'FORCE_CLOSED') return false
    return window.status === 'OPEN' && now >= new Date(window.opensAt) && now <= new Date(window.closesAt)
  })
}

export default function MyGoalsPage() {
  const [sheet, setSheet] = useState(null)
  const [activeCycle, setActiveCycle] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadSheet() {
    setLoading(true)
    try {
      const [nextSheet, nextCycle] = await Promise.all([getMyGoalSheet(), getActiveCycle()])
      setSheet(nextSheet)
      setActiveCycle(nextCycle)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load goal sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSheet() }, [])

  const handleCreate = async () => {
    try {
      const nextSheet = await createGoalSheet()
      setSheet(nextSheet)
      toast.success('Goal sheet created')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not create goal sheet')
    }
  }

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const nextSheetLink = sheet ? `/goals/sheet/${sheet.id}` : '/goals/sheet/active'
  const openWindow = getOpenCheckinWindow(activeCycle)
  const openQuarter = openWindow ? CHECKIN_PHASE_TO_QUARTER[openWindow.phase] : null

  return (
    <AppShell>
      <PageHeader
        title="My Goals"
        subtitle="Track goal sheet status, weightage health, and check-in windows in one view."
        actions={
          <>
            {sheet ? (
              <Link
                className="inline-flex items-center rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface transition hover:scale-[1.02]"
                to={nextSheetLink}
              >
                View Goal Sheet
              </Link>
            ) : null}
            <button
              className="inline-flex items-center rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white transition hover:bg-primary hover:scale-[1.02] disabled:opacity-60"
              disabled={Boolean(sheet) || loading}
              onClick={handleCreate}
            >
              Create Goal Sheet
            </button>
          </>
        }
      />

      {openWindow ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary/30 dark:border-secondary-fixed-dim/30 bg-secondary/10 dark:bg-secondary/10 px-5 py-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-body-md text-body-md font-semibold text-secondary dark:text-secondary-fixed">
                {openQuarter} Check-in is open
              </p>
              <p className="font-body-sm text-body-sm text-on-secondary-container dark:text-secondary-fixed/80">
                Update your achievements by {formatDeadline(openWindow.closesAt)}.
              </p>
            </div>
            <Link
              to={`${nextSheetLink}/checkin?quarter=${openQuarter}`}
              className="rounded-xl bg-secondary px-4 py-2 font-label-bold text-label-bold text-white transition hover:bg-secondary/80 hover:scale-[1.02]"
            >
              Open Check-in
            </Link>
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Goal Sheet Status"
          value={loading ? 'Loading' : sheet?.status || 'Not Created'}
          caption={sheet?.cycle?.name || 'Active cycle'}
        />
        <StatCard
          title="Total Weightage"
          value={`${totalWeightage}%`}
          caption="Target: 100%"
          tone={totalWeightage === 100 ? 'emerald' : 'indigo'}
        />
        <StatCard
          title="Goals"
          value={String(goals.length)}
          caption="Maximum 8 goals"
          tone="emerald"
        />
      </div>

      {!sheet ? (
        <EmptyState
          title="No goal sheet yet"
          description="Create your goal sheet to start adding goals for the active cycle."
          action={
            <button
              onClick={handleCreate}
              className="rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white hover:bg-primary hover:scale-[1.02] transition-all"
            >
              Create Goal Sheet
            </button>
          }
        />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Open the goal sheet and add at least one goal before submitting."
          action={
            <Link
              to={nextSheetLink}
              className="inline-flex rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white hover:bg-primary hover:scale-[1.02] transition-all"
            >
              Add Goals
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <WeightageBar totalWeightage={totalWeightage} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Active Goals ({goals.length})</p>
            </div>
            <div className="space-y-3 p-4">
              {goals.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  canEdit={false}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
