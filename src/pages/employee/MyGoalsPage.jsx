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

export default function MyGoalsPage({ view = 'goals' }) {
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

  const isSubmitted = sheet?.status === 'SUBMITTED'
  const isApproved = sheet?.status === 'APPROVED'
  const isReturned = sheet?.status === 'RETURNED'
  const isDraft = sheet?.status === 'DRAFT' || !sheet?.status

  const isCheckinsView = view === 'checkins'

  const renderCheckinsView = () => (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Q1 Check-in"
          value={sheet?.checkins?.find(c => c.quarter === 'Q1')?.status || 'Not Started'}
          caption="Q1 progress update"
          tone={sheet?.checkins?.find(c => c.quarter === 'Q1')?.status === 'SUBMITTED' ? 'emerald' : 'slate'}
        />
        <StatCard
          title="Q2 Check-in"
          value={sheet?.checkins?.find(c => c.quarter === 'Q2')?.status || 'Not Started'}
          caption="Q2 progress update"
          tone={sheet?.checkins?.find(c => c.quarter === 'Q2')?.status === 'SUBMITTED' ? 'emerald' : 'slate'}
        />
        <StatCard
          title="Q3 Check-in"
          value={sheet?.checkins?.find(c => c.quarter === 'Q3')?.status || 'Not Started'}
          caption="Q3 progress update"
          tone={sheet?.checkins?.find(c => c.quarter === 'Q3')?.status === 'SUBMITTED' ? 'emerald' : 'slate'}
        />
        <StatCard
          title="Q4 Check-in"
          value={sheet?.checkins?.find(c => c.quarter === 'Q4')?.status || 'Not Started'}
          caption="Q4 progress update"
          tone={sheet?.checkins?.find(c => c.quarter === 'Q4')?.status === 'SUBMITTED' ? 'emerald' : 'slate'}
        />
      </div>

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

      <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6">
        <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface mb-4">Quarterly Check-ins</p>
        <div className="space-y-3">
          {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => {
            const checkin = sheet?.checkins?.find(c => c.quarter === quarter)
            const status = checkin?.status || 'NOT_STARTED'
            const canCheckin = sheet?.status === 'APPROVED' && (!openWindow || openQuarter !== quarter)
            
            return (
              <div key={quarter} className="flex items-center justify-between p-3 rounded-xl bg-sand-50 dark:bg-dark-bg">
                <div>
                  <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{quarter} Check-in</p>
                  <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                    {status === 'NOT_STARTED' ? 'Not started' : status === 'DRAFT' ? 'In progress' : status === 'SUBMITTED' ? 'Submitted' : status}
                  </p>
                </div>
                {sheet && canCheckin && (
                  <Link
                    to={`${nextSheetLink}/checkin?quarter=${quarter}`}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-white font-label-bold text-label-bold hover:bg-primary transition"
                  >
                    {status === 'NOT_STARTED' ? 'Start' : 'Edit'}
                  </Link>
                )}
                {status === 'SUBMITTED' && (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-label-bold text-label-bold">Submitted</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  const renderGoalsView = () => (
    <>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Goals Created"
          value={String(goals.length)}
          caption={loading ? 'Loading...' : sheet ? `${goals.length} goals` : 'No sheet'}
          tone={goals.length > 0 ? 'emerald' : 'slate'}
        />
        <StatCard
          title="Total Weightage"
          value={`${totalWeightage}%`}
          caption="Target: 100%"
          tone={totalWeightage === 100 ? 'emerald' : totalWeightage > 0 ? 'indigo' : 'slate'}
        />
        <StatCard
          title="Sheet Status"
          value={loading ? 'Loading' : sheet?.status || 'Not Created'}
          caption={isSubmitted ? 'Awaiting approval' : isApproved ? 'Approved' : isReturned ? 'Needs revision' : isDraft ? 'In progress' : 'No sheet'}
          tone={isApproved ? 'emerald' : isSubmitted ? 'amber' : isReturned ? 'red' : 'slate'}
        />
        <StatCard
          title="Submitted"
          value={isSubmitted ? 'Yes' : 'No'}
          caption={isSubmitted ? 'Awaiting manager review' : 'Not submitted'}
          tone={isSubmitted ? 'amber' : 'slate'}
        />
        <StatCard
          title="Approved"
          value={isApproved ? 'Yes' : 'No'}
          caption={isApproved ? 'Goals approved' : isSubmitted ? 'Pending review' : 'Not yet'}
          tone={isApproved ? 'emerald' : 'slate'}
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
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
    </>
  )

  return (
    <AppShell>
      <PageHeader
        title={isCheckinsView ? 'My Check-ins' : 'My Goals'}
        subtitle={isCheckinsView 
          ? "Track quarterly check-in progress and update achievements." 
          : "Track goal sheet status, weightage health, and check-in windows in one view."}
        actions={
          !isCheckinsView && (
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
          )
        }
      />
      {isCheckinsView ? renderCheckinsView() : renderGoalsView()}
    </AppShell>
  )
}