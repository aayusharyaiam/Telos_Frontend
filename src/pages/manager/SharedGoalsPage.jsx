import { useEffect, useState } from 'react'
import {
  createSharedGoal,
  getSharedGoalRecipients,
  getSharedGoals,
  updateSharedGoalAchievement,
} from '../../api/sharedGoals.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import StatCard from '../../components/shared/StatCard'
import { THRUST_AREAS, UOM_TYPES } from '../../utils/constants'

const emptyDraft = {
  title: '',
  thrustArea: THRUST_AREAS[0],
  description: '',
  uomType: 'NUMERIC_MIN',
  target: '',
  targetDate: '',
  defaultWeightage: 10,
  recipientIds: [],
}

function targetLabel(goal) {
  return goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'
}

export default function SharedGoalsPage() {
  const [sharedGoals, setSharedGoals] = useState([])
  const [recipients, setRecipients] = useState([])
  const [draft, setDraft] = useState(emptyDraft)
  const [achievementDrafts, setAchievementDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [goals, nextRecipients] = await Promise.all([getSharedGoals(), getSharedGoalRecipients()])
      setSharedGoals(goals)
      setRecipients(nextRecipients)

      const nextAchievementDrafts = {}
      for (const goal of goals) {
        nextAchievementDrafts[goal.id] = {
          actualAchievement: goal.actualAchievement ?? '',
          actualDate: goal.actualDate?.slice(0, 10) ?? '',
        }
      }
      setAchievementDrafts(nextAchievementDrafts)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load shared goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(load)
  }, [])

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRecipient = (recipientId) => {
    setDraft((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(recipientId)
        ? prev.recipientIds.filter((id) => id !== recipientId)
        : [...prev.recipientIds, recipientId],
    }))
  }

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    try {
      await createSharedGoal({
        ...draft,
        target: draft.uomType === 'TIMELINE' ? undefined : draft.target,
        targetDate: draft.uomType === 'TIMELINE' ? draft.targetDate : undefined,
      })
      setDraft(emptyDraft)
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not create shared goal')
    } finally {
      setSaving(false)
    }
  }

  const updateAchievementDraft = (goalId, field, value) => {
    setAchievementDrafts((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], [field]: value },
    }))
  }

  const handleAchievementSave = async (goal) => {
    setSaving(true)
    setError('')
    const next = achievementDrafts[goal.id] || {}
    try {
      await updateSharedGoalAchievement(goal.id, {
        actualAchievement: goal.uomType === 'TIMELINE' ? undefined : next.actualAchievement,
        actualDate: goal.uomType === 'TIMELINE' ? next.actualDate : undefined,
      })
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update shared achievement')
    } finally {
      setSaving(false)
    }
  }

  const linkedGoalCount = sharedGoals.reduce((sum, goal) => sum + goal.linkedGoals.length, 0)

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-ink-600">Loading shared goals...</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Shared Goals"
          subtitle="Push common KPIs into employee goal sheets and maintain one shared achievement value."
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Shared Goals" value={String(sharedGoals.length)} caption="Created by you" />
          <StatCard title="Linked Goals" value={String(linkedGoalCount)} caption="Employee goal rows" tone="emerald" />
          <StatCard title="Recipients" value={String(recipients.length)} caption="Available employees" />
        </div>

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <p className="text-sm font-semibold text-ink-900">Create Shared Goal</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Title
              <input
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Thrust Area
              <select
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                value={draft.thrustArea}
                onChange={(event) => updateDraft('thrustArea', event.target.value)}
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
                onChange={(event) => updateDraft('uomType', event.target.value)}
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
                  updateDraft(draft.uomType === 'TIMELINE' ? 'targetDate' : 'target', event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Default Weightage
              <input
                type="number"
                min="10"
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                value={draft.defaultWeightage}
                onChange={(event) => updateDraft('defaultWeightage', event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink-700">
              Description
              <input
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
            </label>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink-700">Recipients</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {recipients.map((recipient) => (
                <label
                  key={recipient.id}
                  className="flex items-center gap-3 rounded-xl border border-ink-100 bg-sand-100 px-3 py-2 text-sm text-ink-700"
                >
                  <input
                    type="checkbox"
                    checked={draft.recipientIds.includes(recipient.id)}
                    onChange={() => toggleRecipient(recipient.id)}
                  />
                  <span>
                    <span className="block font-semibold text-ink-900">{recipient.name}</span>
                    <span className="block text-xs text-ink-500">{recipient.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={saving || !draft.title || !draft.recipientIds.length}
              onClick={handleCreate}
            >
              Push Shared Goal
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Shared Goal Library</p>
          </div>
          <div className="divide-y divide-ink-100">
            {sharedGoals.length === 0 ? (
              <div className="px-6 py-6 text-sm text-ink-600">No shared goals have been pushed yet.</div>
            ) : (
              sharedGoals.map((goal) => {
                const achievement = achievementDrafts[goal.id] || {}
                return (
                  <div key={goal.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_auto]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                        <Badge tone="indigo">Shared</Badge>
                      </div>
                      <p className="text-xs text-ink-500">
                        {goal.thrustArea} | Target: {targetLabel(goal)} | {goal.linkedGoals.length} recipients
                      </p>
                    </div>
                    <div className="text-sm text-ink-700">
                      Weightage: {goal.defaultWeightage}%
                    </div>
                    <label className="grid gap-2 text-sm text-ink-700">
                      Actual
                      <input
                        type={goal.uomType === 'TIMELINE' ? 'date' : 'number'}
                        value={goal.uomType === 'TIMELINE' ? achievement.actualDate : achievement.actualAchievement}
                        onChange={(event) =>
                          updateAchievementDraft(
                            goal.id,
                            goal.uomType === 'TIMELINE' ? 'actualDate' : 'actualAchievement',
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2"
                      />
                    </label>
                    <div className="text-sm text-ink-700">
                      {goal.linkedGoals.map((linkedGoal) => linkedGoal.goalSheet.user.name).join(', ')}
                    </div>
                    <div className="flex items-end">
                      <button
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={saving}
                        onClick={() => handleAchievementSave(goal)}
                      >
                        Save Actual
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
