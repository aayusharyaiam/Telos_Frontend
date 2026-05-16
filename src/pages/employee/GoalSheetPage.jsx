import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import {
  createGoalSheet,
  getGoalSheet,
  getMyGoalSheet,
  submitGoalSheet,
} from '../../api/goalSheets.api'
import { getActiveThrustAreas } from '../../api/admin.api'
import { createGoal, deleteGoal, updateGoal } from '../../api/goals.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import { SkeletonPage } from '../../components/shared/Skeleton'
import WeightageBar from '../../components/goals/WeightageBar'
import GoalCard from '../../components/goals/GoalCard'
import { THRUST_AREAS, UOM_TYPES } from '../../utils/constants'

const rowVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 } }),
}

const buildEmptyGoal = (thrustAreas) => ({
  thrustArea: thrustAreas[0] || THRUST_AREAS[0],
  title: '',
  description: '',
  uomType: 'NUMERIC_MIN',
  target: '',
  targetDate: '',
  weightage: 10,
})

export default function GoalSheetPage() {
  const { sheetId } = useParams()
  const [sheet, setSheet] = useState(null)
  const [thrustAreas, setThrustAreas] = useState(THRUST_AREAS)
  const [draft, setDraft] = useState(() => buildEmptyGoal(THRUST_AREAS))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [shakeForm, setShakeForm] = useState(false)

  async function loadSheet() {
    setLoading(true)
    try {
      if (sheetId === 'active') {
        const mine = (await getMyGoalSheet()) || (await createGoalSheet())
        setSheet(mine)
      } else {
        setSheet(await getGoalSheet(sheetId))
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load goal sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet()
  }, [sheetId])

  useEffect(() => {
    const saved = localStorage.getItem('telos_goal_draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.thrustArea) setDraft(parsed)
      } catch { }
    }
  }, [])

  useEffect(() => {
    if (!draft.title && !draft.target) return
    const timer = setTimeout(() => {
      localStorage.setItem('telos_goal_draft', JSON.stringify(draft))
    }, 30000)
    return () => clearTimeout(timer)
  }, [draft])

  const handleBlurAutoSave = () => {
    if (draft.title || draft.target) {
      localStorage.setItem('telos_goal_draft', JSON.stringify(draft))
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadThrustAreas() {
      try {
        const areas = await getActiveThrustAreas()
        const activeAreas = Array.from(
          new Set(
            areas
              .filter((area) => area.isActive !== false)
              .map((area) => area.name)
              .filter(Boolean)
          )
        )

        const nextAreas = activeAreas.length ? activeAreas : THRUST_AREAS
        if (!mounted) return
        setThrustAreas(nextAreas)
        setDraft((prev) => ({
          ...prev,
          thrustArea: nextAreas.includes(prev.thrustArea) ? prev.thrustArea : nextAreas[0],
        }))
      } catch (err) {
        if (!mounted) return
        toast.error('Could not load thrust areas. Using defaults.')
        setThrustAreas(THRUST_AREAS)
        setDraft((prev) => ({
          ...prev,
          thrustArea: THRUST_AREAS.includes(prev.thrustArea) ? prev.thrustArea : THRUST_AREAS[0],
        }))
      }
    }

    loadThrustAreas()
    return () => {
      mounted = false
    }
  }, [])

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const canEdit = sheet && ['DRAFT', 'RETURNED'].includes(sheet.status)
  const heavyGoals = goals.filter(g => Number(g.weightage) > 90)

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddGoal = async () => {
    if (!sheet) return
    setSaving(true)
    try {
      await createGoal({
        ...draft,
        goalSheetId: sheet.id,
        target: draft.uomType === 'TIMELINE' ? undefined : draft.target,
        targetDate: draft.uomType === 'TIMELINE' ? draft.targetDate : undefined,
      })
      setDraft(buildEmptyGoal(thrustAreas))
      await loadSheet()
      toast.success('Goal added')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not add goal')
      setShakeForm(true)
      setTimeout(() => setShakeForm(false), 400)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateGoal = async (goal, field, value) => {
    setSheet((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.id === goal.id ? { ...item, [field]: value } : item)),
    }))

    try {
      await updateGoal(goal.id, { [field]: value })
      await loadSheet()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update goal')
      await loadSheet()
    }
  }

  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId)
      await loadSheet()
      toast.success('Goal deleted')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not delete goal')
    }
  }

  const handleSubmit = async () => {
    if (!sheet) return
    setConfirmSubmit(false)
    setSaving(true)
    try {
      setSheet(await submitGoalSheet(sheet.id))
      toast.success('Goal sheet submitted')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not submit goal sheet')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
          title="Goal Sheet"
          subtitle="Add goals, balance weightage to exactly 100%, then submit for manager approval."
          chips={<Badge tone={sheet?.status === 'APPROVED' ? 'emerald' : 'indigo'}>{sheet?.status || 'Draft'}</Badge>}
          actions={
            <button
              className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!sheet || saving || totalWeightage !== 100 || !goals.length || !canEdit}
              onClick={() => setConfirmSubmit(true)}
            >
              Submit for Approval
            </button>
          }
        />

        <ConfirmModal
          open={confirmSubmit}
          title="Submit Goal Sheet"
          message="Are you sure you want to submit your goal sheet for manager approval? You won't be able to edit goals after submission."
          confirmLabel="Submit"
          onConfirm={handleSubmit}
          onCancel={() => setConfirmSubmit(false)}
          loading={saving}
        />

        {sheet?.returnReason ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="rounded-xl bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 px-4 py-3 font-body-md text-body-md text-amber-800">
              Return reason: {sheet.returnReason}
            </p>
          </motion.div>
        ) : null}

        <WeightageBar totalWeightage={totalWeightage} />
        {heavyGoals.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="rounded-xl bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 px-4 py-3 font-body-md text-body-md text-amber-800">
              Warning: {heavyGoals.map(g => g.title).join(', ')} {'>'}90% weightage — this leaves very little room for other goals.
            </p>
          </motion.div>
        ) : null}

        {canEdit ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              animate={shakeForm ? { x: [0, -4, 4, -4, 0] } : { x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
            >
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Add Goal</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                  Title
                  <input
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    value={draft.title}
                    onChange={(event) => handleDraftChange('title', event.target.value)}
                    onBlur={handleBlurAutoSave}
                  />
                </label>
                <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                  Thrust Area
                  <select
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    value={draft.thrustArea}
                    onChange={(event) => handleDraftChange('thrustArea', event.target.value)}
                  >
                    {thrustAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                  UoM
                  <select
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    value={draft.uomType}
                    onChange={(event) => handleDraftChange('uomType', event.target.value)}
                  >
                    {UOM_TYPES.map((uom) => (
                      <option key={uom.value} value={uom.value}>{uom.label}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                  Target
                  <input
                    type={draft.uomType === 'TIMELINE' ? 'date' : 'number'}
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    value={draft.uomType === 'TIMELINE' ? draft.targetDate : draft.target}
                    onChange={(event) =>
                      handleDraftChange(draft.uomType === 'TIMELINE' ? 'targetDate' : 'target', event.target.value)
                    }
                  />
                </label>
                <label className="grid gap-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface">
                  Weightage
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                    value={draft.weightage}
                    onChange={(event) => handleDraftChange('weightage', event.target.value)}
                    onBlur={handleBlurAutoSave}
                  />
                </label>
                <div className="flex items-end">
                  <button
                    className="w-full rounded-xl bg-primary-container px-4 py-3 text-sm font-semibold text-white hover:scale-[1.02] disabled:opacity-60"
                    disabled={saving || !draft.title}
                    onClick={handleAddGoal}
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}>
          <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goals ({goals.length})</p>
            </div>
            <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                  className="hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <GoalCard
                    goal={goal}
                    canEdit={canEdit}
                    onUpdateWeightage={(g, value) => handleUpdateGoal(g, 'weightage', value)}
                    onDelete={handleDeleteGoal}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
