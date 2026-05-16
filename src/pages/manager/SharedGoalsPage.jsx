import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getActiveThrustAreas } from '../../api/admin.api'
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
import { QUARTERS, THRUST_AREAS, UOM_TYPES } from '../../utils/constants'

const buildEmptyDraft = (thrustAreas) => ({
  title: '',
  thrustArea: thrustAreas[0] || THRUST_AREAS[0],
  description: '',
  uomType: 'NUMERIC_MIN',
  target: '',
  targetDate: '',
  defaultWeightage: 10,
  recipientIds: [],
  primaryOwnerId: '',
})

function targetLabel(goal) {
  return goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'
}

function getSharedGoalQuarterDraft(goal, quarter) {
  const linkedCheckin = goal.linkedGoals
    ?.flatMap((linkedGoal) => linkedGoal.checkins || [])
    .find((checkin) => checkin.quarter === quarter)

  return {
    actualAchievement: linkedCheckin?.actualAchievement ?? goal.actualAchievement ?? '',
    actualDate: linkedCheckin?.actualDate?.slice(0, 10) ?? goal.actualDate?.slice(0, 10) ?? '',
  }
}

export default function SharedGoalsPage() {
  const [sharedGoals, setSharedGoals] = useState([])
  const [recipients, setRecipients] = useState([])
  const [thrustAreas, setThrustAreas] = useState(THRUST_AREAS)
  const [draft, setDraft] = useState(() => buildEmptyDraft(THRUST_AREAS))
  const [achievementDrafts, setAchievementDrafts] = useState({})
  const [achievementQuarter, setAchievementQuarter] = useState('Q2')
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
        nextAchievementDrafts[goal.id] = getSharedGoalQuarterDraft(goal, achievementQuarter)
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

  useEffect(() => {
    const nextAchievementDrafts = {}
    for (const goal of sharedGoals) {
      nextAchievementDrafts[goal.id] = getSharedGoalQuarterDraft(goal, achievementQuarter)
    }
    setAchievementDrafts(nextAchievementDrafts)
  }, [achievementQuarter, sharedGoals])

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

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRecipient = (recipientId) => {
    setDraft((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(recipientId)
        ? prev.recipientIds.filter((id) => id !== recipientId)
        : [...prev.recipientIds, recipientId],
      primaryOwnerId:
        prev.primaryOwnerId === recipientId
          ? prev.recipientIds.filter((id) => id !== recipientId)[0] || ''
          : prev.primaryOwnerId || recipientId,
    }))
  }

  const primaryRecipient = recipients.find((recipient) => recipient.id === (draft.primaryOwnerId || draft.recipientIds[0]))

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    try {
      await createSharedGoal({
        ...draft,
        target: draft.uomType === 'TIMELINE' ? undefined : draft.target,
        targetDate: draft.uomType === 'TIMELINE' ? draft.targetDate : undefined,
        primaryOwnerId: draft.primaryOwnerId || draft.recipientIds[0],
      })
      setDraft(buildEmptyDraft(thrustAreas))
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
        quarter: achievementQuarter,
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
        <p className="font-body-md text-body-md text-ink-600 dark:text-outline">Loading shared goals...</p>
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

        {error ? <p className="rounded-xl bg-error-container/40 dark:bg-error-container/20 px-4 py-3 font-body-md text-body-md text-error">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Shared Goals" value={String(sharedGoals.length)} caption="Created by you" />
          <StatCard title="Linked Goals" value={String(linkedGoalCount)} caption="Employee goal rows" tone="emerald" />
          <StatCard title="Recipients" value={String(recipients.length)} caption="Available employees" />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 p-6 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Create Shared Goal</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Title
              <input
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
            </label>
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Thrust Area
              <select
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.thrustArea}
                onChange={(event) => updateDraft('thrustArea', event.target.value)}
              >
                {thrustAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              UoM
              <select
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.uomType}
                onChange={(event) => updateDraft('uomType', event.target.value)}
              >
                {UOM_TYPES.map((uom) => (
                  <option key={uom.value} value={uom.value}>{uom.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Target
              <input
                type={draft.uomType === 'TIMELINE' ? 'date' : 'number'}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.uomType === 'TIMELINE' ? draft.targetDate : draft.target}
                onChange={(event) =>
                  updateDraft(draft.uomType === 'TIMELINE' ? 'targetDate' : 'target', event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Default Weightage
              <input
                type="number"
                min="10"
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.defaultWeightage}
                onChange={(event) => updateDraft('defaultWeightage', event.target.value)}
              />
            </label>
            <label className="grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Description
              <input
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
            </label>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">Recipients</p>
              {primaryRecipient ? (
                <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">Primary owner: {primaryRecipient.name}</p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {recipients.map((recipient) => (
                <label
                  key={recipient.id}
                  className="flex items-center gap-3 rounded-xl border border-sand-200/50 dark:border-outline/20 bg-sand-100 px-3 py-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface"
                >
                  <input
                    type="checkbox"
                    checked={draft.recipientIds.includes(recipient.id)}
                    onChange={() => toggleRecipient(recipient.id)}
                  />
                  <span>
                    <span className="block font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{recipient.name}</span>
                    <span className="block font-body-sm text-body-sm text-ink-500 dark:text-outline">{recipient.email}</span>
                  </span>
                </label>
              ))}
            </div>
            {draft.recipientIds.length ? (
              <label className="mt-4 grid gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface md:max-w-sm">
                Primary Owner
                <select
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-3 font-body-md text-body-md"
                  value={draft.primaryOwnerId || draft.recipientIds[0]}
                  onChange={(event) => updateDraft('primaryOwnerId', event.target.value)}
                >
                  {recipients
                    .filter((recipient) => draft.recipientIds.includes(recipient.id))
                    .map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>{recipient.name}</option>
                    ))}
                </select>
              </label>
            ) : null}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              className="rounded-xl bg-primary-container px-4 py-2 font-headline-md text-headline-md text-white hover:scale-[1.02] disabled:opacity-60"
              disabled={saving || !draft.title || !draft.recipientIds.length}
              onClick={handleCreate}
            >
              Push Shared Goal
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Shared Goal Library</p>
            <label className="flex items-center gap-2 font-headline-md text-headline-md text-ink-700 dark:text-inverse-on-surface">
              Actual Quarter
              <select
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 font-body-md text-body-md"
                value={achievementQuarter}
                onChange={(event) => setAchievementQuarter(event.target.value)}
              >
                {QUARTERS.map((quarter) => (
                  <option key={quarter} value={quarter}>{quarter}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
            {sharedGoals.length === 0 ? (
              <div className="px-6 py-6 font-body-md text-body-md text-ink-600 dark:text-outline">No shared goals have been pushed yet.</div>
            ) : (
              sharedGoals.map((goal, index) => {
                const achievement = achievementDrafts[goal.id] || {}
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr_auto] hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                        <Badge tone="indigo">Shared</Badge>
                      </div>
                      <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                        {goal.thrustArea} | Target: {targetLabel(goal)} | {goal.linkedGoals.length} recipients
                        {goal.primaryOwner?.name ? ` | Owner: ${goal.primaryOwner.name}` : ''}
                      </p>
                    </div>
                    <div className="font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                      Weightage: {goal.defaultWeightage}%
                    </div>
                    <label className="grid gap-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
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
                        className="rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2"
                      />
                    </label>
                    <div className="font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                      {goal.linkedGoals.map((linkedGoal) => linkedGoal.goalSheet.user.name).join(', ')}
                    </div>
                    <div className="flex items-end">
                      <button
                        className="rounded-xl bg-primary-container px-4 py-2 font-headline-md text-headline-md text-white hover:scale-[1.02] disabled:opacity-60"
                        disabled={saving}
                        onClick={() => handleAchievementSave(goal)}
                      >
                        Save Actual
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
