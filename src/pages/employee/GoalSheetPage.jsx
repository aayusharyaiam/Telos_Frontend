import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  createGoalSheet,
  getGoalSheet,
  getMyGoalSheet,
  submitGoalSheet,
} from '../../api/goalSheets.api'
import { createGoal, deleteGoal, updateGoal } from '../../api/goals.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import { THRUST_AREAS, UOM_TYPES } from '../../utils/constants'

const emptyGoal = {
  thrustArea: THRUST_AREAS[0],
  title: '',
  description: '',
  uomType: 'NUMERIC_MIN',
  target: '',
  targetDate: '',
  weightage: 10,
}

export default function GoalSheetPage() {
  const { sheetId } = useParams()
  const [sheet, setSheet] = useState(null)
  const [draft, setDraft] = useState(emptyGoal)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadSheet() {
    setLoading(true)
    setError('')
    try {
      if (sheetId === 'active' || sheetId === 'demo') {
        const mine = (await getMyGoalSheet()) || (await createGoalSheet())
        setSheet(mine)
      } else {
        setSheet(await getGoalSheet(sheetId))
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load goal sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet()
  }, [sheetId])

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const canEdit = sheet && ['DRAFT', 'RETURNED'].includes(sheet.status)
  const weightageColor =
    totalWeightage === 100 ? 'bg-accent-500' : totalWeightage > 100 ? 'bg-red-500' : 'bg-primary-500'

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddGoal = async () => {
    if (!sheet) return
    setSaving(true)
    setError('')
    try {
      await createGoal({
        ...draft,
        goalSheetId: sheet.id,
        target: draft.uomType === 'TIMELINE' ? undefined : draft.target,
        targetDate: draft.uomType === 'TIMELINE' ? draft.targetDate : undefined,
      })
      setDraft(emptyGoal)
      await loadSheet()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not add goal')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateGoal = async (goal, field, value) => {
    setError('')
    setSheet((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.id === goal.id ? { ...item, [field]: value } : item)),
    }))

    try {
      await updateGoal(goal.id, { [field]: value })
      await loadSheet()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update goal')
      await loadSheet()
    }
  }

  const handleDeleteGoal = async (goalId) => {
    setError('')
    try {
      await deleteGoal(goalId)
      await loadSheet()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not delete goal')
    }
  }

  const handleSubmit = async () => {
    if (!sheet) return
    setSaving(true)
    setError('')
    try {
      setSheet(await submitGoalSheet(sheet.id))
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not submit goal sheet')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-ink-600">Loading goal sheet...</p>
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
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!sheet || saving || totalWeightage !== 100 || !goals.length || !canEdit}
              onClick={handleSubmit}
            >
              Submit for Approval
            </button>
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {sheet?.returnReason ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Return reason: {sheet.returnReason}
          </p>
        ) : null}

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Weightage Health</p>
              <p className="text-xs text-ink-500">Total must equal 100% to submit.</p>
            </div>
            <Badge tone={totalWeightage === 100 ? 'emerald' : 'amber'}>
              {totalWeightage}% allocated
            </Badge>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-sand-200">
            <div
              className={`h-2 rounded-full ${weightageColor}`}
              style={{ width: `${Math.min(totalWeightage, 100)}%` }}
            />
          </div>
        </div>

        {canEdit ? (
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Add Goal</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                Title
                <input
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  value={draft.title}
                  onChange={(event) => handleDraftChange('title', event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                Thrust Area
                <select
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  value={draft.thrustArea}
                  onChange={(event) => handleDraftChange('thrustArea', event.target.value)}
                >
                  {THRUST_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                UoM
                <select
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  value={draft.uomType}
                  onChange={(event) => handleDraftChange('uomType', event.target.value)}
                >
                  {UOM_TYPES.map((uom) => (
                    <option key={uom.value} value={uom.value}>{uom.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                Target
                <input
                  type={draft.uomType === 'TIMELINE' ? 'date' : 'number'}
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  value={draft.uomType === 'TIMELINE' ? draft.targetDate : draft.target}
                  onChange={(event) =>
                    handleDraftChange(draft.uomType === 'TIMELINE' ? 'targetDate' : 'target', event.target.value)
                  }
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-ink-700">
                Weightage
                <input
                  type="number"
                  min="10"
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  value={draft.weightage}
                  onChange={(event) => handleDraftChange('weightage', event.target.value)}
                />
              </label>
              <div className="flex items-end">
                <button
                  className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={saving || !draft.title}
                  onClick={handleAddGoal}
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Goals ({goals.length})</p>
          </div>
          <div className="divide-y divide-ink-100">
            {goals.map((goal) => (
              <div key={goal.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                  <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                </div>
                <div className="text-sm text-ink-700">Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}</div>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  Weightage
                  <input
                    type="number"
                    min="10"
                    value={goal.weightage}
                    disabled={!canEdit}
                    onChange={(event) => handleUpdateGoal(goal, 'weightage', Number(event.target.value))}
                    className="w-20 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm disabled:bg-sand-100"
                  />
                  %
                </label>
                {canEdit ? (
                  <button
                    className="text-sm font-semibold text-red-600"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    Delete
                  </button>
                ) : (
                  <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>{goal.isLocked ? 'Locked' : sheet.status}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
