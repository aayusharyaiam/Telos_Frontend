import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getCheckins, upsertCheckin } from '../../api/checkins.api'
import { getActiveCycle } from '../../api/cycles.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import ProgressScoreBadge from '../../components/goals/ProgressScoreBadge'
import { GOAL_STATUSES, QUARTERS } from '../../utils/constants'

const rowVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 } }),
}

const CHECKIN_PHASE_TO_QUARTER = {
  Q1_CHECKIN: 'Q1',
  Q2_CHECKIN: 'Q2',
  Q3_CHECKIN: 'Q3',
  Q4_CHECKIN: 'Q4',
}

function currentCheckin(goal) {
  return goal.checkins?.[0] || null
}

function formatDeadline(value) {
  if (!value) return 'the deadline'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getOpenCheckinWindow(cycle, quarter) {
  const now = new Date()
  return cycle?.windows?.find((window) => {
    if (CHECKIN_PHASE_TO_QUARTER[window.phase] !== quarter) return false
    if (window.status === 'FORCE_OPEN') return true
    if (window.status === 'FORCE_CLOSED') return false
    return window.status === 'OPEN' && now >= new Date(window.opensAt) && now <= new Date(window.closesAt)
  })
}

export default function CheckinEntryPage() {
  const { sheetId } = useParams()
  const [searchParams] = useSearchParams()
  const requestedQuarter = searchParams.get('quarter')?.toUpperCase()
  const [data, setData] = useState(null)
  const [activeCycle, setActiveCycle] = useState(null)
  const [quarter, setQuarter] = useState(QUARTERS.includes(requestedQuarter) ? requestedQuarter : 'Q2')
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [next, nextCycle] = await Promise.all([getCheckins({ sheetId, quarter }), getActiveCycle()])
      setData(next)
      setActiveCycle(nextCycle)
      const nextDrafts = {}
      for (const goal of next.sheet.goals) {
        const checkin = currentCheckin(goal)
        nextDrafts[goal.id] = {
          actualAchievement: checkin?.actualAchievement ?? '',
          actualDate: checkin?.actualDate?.slice(0, 10) ?? '',
          goalStatus: checkin?.goalStatus || 'NOT_STARTED',
          employeeNotes: checkin?.employeeNotes || '',
        }
      }
      setDrafts(nextDrafts)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load check-ins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [sheetId, quarter])

  const updateDraft = (goalId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], [field]: value },
    }))
  }

  const saveGoal = async (goal) => {
    setSavingId(goal.id)
    setError('')
    const draft = drafts[goal.id] || {}
    try {
      await upsertCheckin({
        goalId: goal.id,
        quarter,
        goalStatus: draft.goalStatus,
        employeeNotes: draft.employeeNotes,
        actualAchievement: goal.isShared || goal.uomType === 'TIMELINE' ? undefined : draft.actualAchievement,
        actualDate: goal.isShared || goal.uomType !== 'TIMELINE' ? undefined : draft.actualDate,
      })
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not save check-in')
    } finally {
      setSavingId('')
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="font-body-md text-body-md text-ink-600 dark:text-outline">Loading check-ins...</p>
      </AppShell>
    )
  }

  const sheet = data?.sheet
  const goals = sheet?.goals || []
  const canEdit = data?.windowOpen && sheet?.status === 'APPROVED'
  const openWindow = getOpenCheckinWindow(activeCycle, quarter)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={`${quarter} Check-in`}
          subtitle="Capture achievements to date. Entries are cumulative per quarter."
          chips={<Badge tone={canEdit ? 'emerald' : 'slate'}>{canEdit ? 'Window Open' : 'Read Only'}</Badge>}
          actions={
            <select
              className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 font-body-md text-body-md"
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
            >
              {QUARTERS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          }
        />

        {error ? <p className="rounded-xl bg-error-container/40 dark:bg-error-container/20 px-4 py-3 font-body-md text-body-md text-error">{error}</p> : null}
        {openWindow ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-accent-200 bg-secondary/10 dark:bg-secondary/10 px-5 py-4 shadow-sm">
              <p className="font-headline-md text-headline-md text-secondary dark:text-secondary-fixed">{quarter} Check-in is open</p>
              <p className="font-body-md text-body-md text-accent-800">This window closes on {formatDeadline(openWindow.closesAt)}.</p>
            </div>
          </motion.div>
        ) : null}
        {sheet?.status !== 'APPROVED' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="rounded-xl bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 px-4 py-3 font-body-md text-body-md text-amber-800">
              Your goal sheet must be approved before check-ins can be entered.
            </p>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Achievement Entry</p>
            </div>
            <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
              {goals.length === 0 ? (
                <div className="px-6 py-6 font-body-md text-body-md text-ink-600 dark:text-outline">No approved goals available for check-in.</div>
              ) : (
                goals.map((goal, index) => {
                  const draft = drafts[goal.id] || {}
                  const checkin = currentCheckin(goal)

                  return (
                    <motion.div
                      key={goal.id}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      custom={index}
                      className="hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                    >
                      <div className="grid gap-4 px-6 py-5 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-label-bold text-label-bold text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                            {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
                          </div>
                          <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                            {goal.thrustArea} | Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                          </p>
                        </div>
                        {goal.isShared && (draft.actualAchievement === '' || draft.actualAchievement === null) ? (
                          <div className="flex items-center font-body-md text-body-md text-amber-700">
                            <span className="rounded-lg bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 px-3 py-2">Awaiting owner update</span>
                          </div>
                        ) : (
                          <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                            Actual
                            <input
                              type={goal.uomType === 'TIMELINE' ? 'date' : 'number'}
                              disabled={!canEdit || goal.isShared}
                              value={goal.uomType === 'TIMELINE' ? draft.actualDate : draft.actualAchievement}
                              onChange={(event) =>
                                updateDraft(goal.id, goal.uomType === 'TIMELINE' ? 'actualDate' : 'actualAchievement', event.target.value)
                              }
                              className="rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 disabled:bg-sand-100"
                            />
                          </label>
                        )}
                        <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                          Status
                          <select
                            disabled={!canEdit}
                            value={draft.goalStatus}
                            onChange={(event) => updateDraft(goal.id, 'goalStatus', event.target.value)}
                            className="rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 disabled:bg-sand-100"
                          >
                            {GOAL_STATUSES.map((status) => (
                              <option key={status} value={status}>{status.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                          Notes
                          <input
                            disabled={!canEdit}
                            value={draft.employeeNotes}
                            onChange={(event) => updateDraft(goal.id, 'employeeNotes', event.target.value)}
                            className="rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 disabled:bg-sand-100"
                          />
                        </label>
                        <div className="flex items-end gap-3">
                          <ProgressScoreBadge
                            uomType={goal.uomType}
                            target={goal.target}
                            targetDate={goal.targetDate}
                            actual={checkin?.actualAchievement}
                            actualDate={checkin?.actualDate}
                          />
                          <button
                            disabled={!canEdit || savingId === goal.id}
                            onClick={() => saveGoal(goal)}
                            className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] disabled:opacity-60"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
