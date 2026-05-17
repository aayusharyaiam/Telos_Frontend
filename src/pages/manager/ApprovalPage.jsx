import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { approveGoalSheet, getGoalSheet, getTeamGoalSheets, returnGoalSheet } from '../../api/goalSheets.api'
import { updateGoal } from '../../api/goals.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import ConfirmModal from '../../components/shared/ConfirmModal'

export default function ApprovalPage() {
  const { sheetId } = useParams()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState(null)
  const [originals, setOriginals] = useState({})
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReturn, setConfirmReturn] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const diffRef = useRef(null)

  async function loadSheet() {
    setLoading(true)
    try {
      if (sheetId === 'active') {
        const team = await getTeamGoalSheets()
        setSheet(team.find((item) => item.status === 'SUBMITTED') || team[0] || null)
      } else {
        setSheet(await getGoalSheet(sheetId))
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load approval sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet()
  }, [sheetId])

  useEffect(() => {
    if (sheet?.goals) {
      setOriginals((prev) => {
        const next = { ...prev }
        for (const goal of sheet.goals) {
          if (!next[goal.id]) {
            next[goal.id] = { weightage: goal.weightage, target: goal.target, targetDate: goal.targetDate }
          }
        }
        return next
      })
    }
  }, [sheet?.goals])

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const canApprove = sheet?.status === 'SUBMITTED'

  const editedGoals = goals.filter(goal => {
    const orig = originals[goal.id]
    if (!orig) return false
    return orig.weightage !== goal.weightage || orig.target !== goal.target || orig.targetDate !== goal.targetDate
  })

  const goalTargetValue = (goal) => (
    goal.uomType === 'TIMELINE' ? goal.targetDate?.slice(0, 10) || '' : goal.target ?? ''
  )

  const handleWeightageChange = async (goal, value) => {
    setSheet((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.id === goal.id ? { ...item, weightage: value } : item)),
    }))
    try {
      await updateGoal(goal.id, { weightage: value })
      await loadSheet()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update weightage')
      await loadSheet()
    }
  }

  const handleTargetChange = async (goal, value) => {
    const field = goal.uomType === 'TIMELINE' ? 'targetDate' : 'target'
    const nextValue = goal.uomType === 'TIMELINE' ? value : Number(value)

    setSheet((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.id === goal.id ? { ...item, [field]: nextValue } : item)),
    }))
    try {
      await updateGoal(goal.id, { [field]: nextValue })
      await loadSheet()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update target')
      await loadSheet()
    }
  }

  const handleApprove = async () => {
    if (!sheet) return
    setConfirmApprove(false)
    setSaving(true)
    try {
      setSheet(await approveGoalSheet(sheet.id))
      toast.success('Goal sheet approved')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not approve goal sheet')
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async () => {
    if (!sheet) return
    setConfirmReturn(false)
    setSaving(true)
    try {
      await returnGoalSheet(sheet.id, reason)
      toast.success('Goal sheet returned')
      navigate('/manager/team')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not return goal sheet')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <SkeletonPage rows={4} statCards={0} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Approval Review"
          subtitle={sheet ? `Reviewing ${sheet.user.name}'s goal sheet.` : 'No sheet selected.'}
          chips={
            <div className="flex items-center gap-2">
              <Badge tone={canApprove ? 'amber' : 'slate'}>{sheet?.status || 'None'}</Badge>
              {editedGoals.length > 0 ? <Badge tone="amber">{editedGoals.length} edited</Badge> : null}
            </div>
          }
          actions={
            <button
              className="rounded-xl bg-primary-container px-4 py-2 font-headline-md text-headline-md text-white hover:scale-[1.02] disabled:opacity-60"
              disabled={!canApprove || saving || totalWeightage !== 100}
              onClick={() => setConfirmApprove(true)}
            >
              Approve Goal Sheet
            </button>
          }
        />

        <ConfirmModal
          open={confirmApprove}
          title="Approve Goal Sheet"
          message={`Are you sure you want to approve ${sheet?.user?.name}'s goal sheet? All goals will be locked.${
            editedGoals.length > 0 ? ` You have modified ${editedGoals.length} goal(s).` : ''
          }`}
          confirmLabel="Approve"
          onConfirm={handleApprove}
          onCancel={() => setConfirmApprove(false)}
          loading={saving}
        />

        <ConfirmModal
          open={confirmReturn}
          title="Return Goal Sheet"
          message={`Are you sure you want to return ${sheet?.user?.name}'s goal sheet with the provided reason?`}
          confirmLabel="Return"
          tone="warning"
          onConfirm={handleReturn}
          onCancel={() => setConfirmReturn(false)}
          loading={saving}
        />

        {!sheet ? (
          <p className="font-body-md text-body-md text-ink-600 dark:text-outline">There are no team goal sheets to review yet.</p>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 p-5 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
              <div className="flex items-center justify-between">
                <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Total Weightage</p>
                <Badge tone={totalWeightage === 100 ? 'emerald' : 'amber'}>
                  {totalWeightage}%
                </Badge>
              </div>
              <p className="mt-2 font-body-sm text-body-sm text-ink-500 dark:text-outline">
                Managers can adjust weightage while the sheet is submitted.
              </p>
              {editedGoals.length > 0 ? (
                <button
                  ref={diffRef}
                  onClick={() => setShowDiff(!showDiff)}
                  className="mt-3 font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:text-primary hover:dark:text-primary-fixed-dim"
                >
                  {showDiff ? 'Hide diff view' : `Show diff view (${editedGoals.length} goal(s) modified)`}
                </button>
              ) : null}
            </motion.div>

            {showDiff && editedGoals.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 p-4 shadow-sm ring-1 ring-amber-200">
                <p className="mb-3 font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Changes Made (Original → Edited)</p>
                <div className="space-y-2">
                  {editedGoals.map((goal) => {
                    const orig = originals[goal.id]
                    return (
                      <div key={goal.id} className="rounded-xl bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md">
                        <p className="font-semibold text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                        <div className="mt-1 grid grid-cols-2 gap-4 font-body-sm text-body-sm">
                          {orig.weightage !== goal.weightage ? (
                            <div>
                              <span className="text-ink-500 dark:text-outline">Weightage: </span>
                              <span className="text-red-500 line-through">{orig.weightage}%</span>
                              {' → '}
                              <span className="text-secondary dark:text-secondary-fixed font-semibold">{goal.weightage}%</span>
                            </div>
                          ) : (
                            <div><span className="text-ink-500 dark:text-outline">Weightage: </span>{goal.weightage}%</div>
                          )}
                          {orig.target !== goal.target || orig.targetDate !== goal.targetDate ? (
                            <div>
                              <span className="text-ink-500 dark:text-outline">Target: </span>
                              <span className="text-red-500 line-through">
                                {orig.target ?? orig.targetDate?.slice(0, 10) ?? '--'}
                              </span>
                              {' → '}
                              <span className="text-secondary dark:text-secondary-fixed font-semibold">
                                {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ) : null}

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
              <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
                <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goals Under Review</p>
              </div>
              <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
                {goals.map((goal, index) => {
                  const isEdited = originals[goal.id] && (
                    originals[goal.id].weightage !== goal.weightage ||
                    originals[goal.id].target !== goal.target ||
                    originals[goal.id].targetDate !== goal.targetDate
                  )
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-1 gap-3 sm:gap-4 px-4 sm:px-6 py-5 md:grid-cols-[2fr_1fr_1fr] hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors ${
                        isEdited ? 'bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                          {isEdited ? <Badge tone="amber">Edited</Badge> : null}
                        </div>
                        <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">{goal.thrustArea}</p>
                      </div>
                      <label className={`flex items-center gap-2 rounded-xl px-3 py-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface ${isEdited ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-sand-100 dark:bg-dark-surface'}`}>
                        Target
                        <input
                          type={goal.uomType === 'TIMELINE' ? 'date' : 'number'}
                          value={goalTargetValue(goal)}
                          disabled={!canApprove}
                          onChange={(event) => handleTargetChange(goal, event.target.value)}
                          className="w-28 rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-2 py-1 disabled:bg-sand-100 dark:disabled:bg-dark-surface/50 dark:text-inverse-on-surface"
                        />
                        {isEdited && (
                          originals[goal.id]?.target !== goal.target ||
                          originals[goal.id]?.targetDate !== goal.targetDate
                        ) ? (
                          <span className="ml-2 font-label-bold text-label-bold text-red-500 line-through">
                            orig: {originals[goal.id]?.target ?? originals[goal.id]?.targetDate?.slice(0, 10) ?? '--'}
                          </span>
                        ) : null}
                      </label>
                      <label className={`flex items-center gap-2 rounded-xl px-3 py-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface ${isEdited ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-sand-100 dark:bg-dark-surface'}`}>
                        Weightage
                        <input
                          type="number"
                          min="10"
                          value={goal.weightage}
                          disabled={!canApprove}
                          onChange={(event) => handleWeightageChange(goal, Number(event.target.value))}
                          className="w-20 rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-2 py-1 disabled:bg-sand-100 dark:disabled:bg-dark-surface/50 dark:text-inverse-on-surface"
                        />
                        %
                        {isEdited && originals[goal.id]?.weightage !== goal.weightage ? (
                          <span className="ml-1 font-label-bold text-label-bold text-red-500 line-through">
                            {originals[goal.id]?.weightage}%
                          </span>
                        ) : null}
                      </label>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {canApprove ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 p-6 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
                <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
                  Return Reason
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    placeholder="Explain what the employee should revise before resubmitting."
                  />
                </label>
                <div className="mt-4 flex justify-end">
                  <button
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface disabled:opacity-60"
                    disabled={saving || reason.trim().length < 20}
                    onClick={() => setConfirmReturn(true)}
                  >
                    Return with Reason
                  </button>
                </div>
              </motion.div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  )
}
