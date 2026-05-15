import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCheckins, upsertCheckin } from '../../api/checkins.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import { GOAL_STATUSES } from '../../utils/constants'

const quarter = 'Q2'

function currentCheckin(goal) {
  return goal.checkins?.[0] || null
}

export default function CheckinEntryPage() {
  const { sheetId } = useParams()
  const [data, setData] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const next = await getCheckins({ sheetId, quarter })
      setData(next)
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
  }, [sheetId])

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
        <p className="text-sm text-ink-600">Loading check-ins...</p>
      </AppShell>
    )
  }

  const sheet = data?.sheet
  const goals = sheet?.goals || []
  const canEdit = data?.windowOpen && sheet?.status === 'APPROVED'

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={`${quarter} Check-in`}
          subtitle="Capture achievements to date. Entries are cumulative per quarter."
          chips={<Badge tone={canEdit ? 'emerald' : 'slate'}>{canEdit ? 'Window Open' : 'Read Only'}</Badge>}
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {sheet?.status !== 'APPROVED' ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your goal sheet must be approved before check-ins can be entered.
          </p>
        ) : null}

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Achievement Entry</p>
          </div>
          <div className="divide-y divide-ink-100">
            {goals.length === 0 ? (
              <div className="px-6 py-6 text-sm text-ink-600">No approved goals available for check-in.</div>
            ) : (
              goals.map((goal) => {
                const draft = drafts[goal.id] || {}
                const checkin = currentCheckin(goal)

                return (
                  <div key={goal.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                        {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
                      </div>
                      <p className="text-xs text-ink-500">
                        {goal.thrustArea} | Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                      </p>
                    </div>
                    <label className="grid gap-2 text-sm text-ink-700">
                      Actual
                      <input
                        type={goal.uomType === 'TIMELINE' ? 'date' : 'number'}
                        disabled={!canEdit || goal.isShared}
                        value={goal.uomType === 'TIMELINE' ? draft.actualDate : draft.actualAchievement}
                        onChange={(event) =>
                          updateDraft(goal.id, goal.uomType === 'TIMELINE' ? 'actualDate' : 'actualAchievement', event.target.value)
                        }
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 disabled:bg-sand-100"
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-ink-700">
                      Status
                      <select
                        disabled={!canEdit}
                        value={draft.goalStatus}
                        onChange={(event) => updateDraft(goal.id, 'goalStatus', event.target.value)}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 disabled:bg-sand-100"
                      >
                        {GOAL_STATUSES.map((status) => (
                          <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-ink-700">
                      Notes
                      <input
                        disabled={!canEdit}
                        value={draft.employeeNotes}
                        onChange={(event) => updateDraft(goal.id, 'employeeNotes', event.target.value)}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 disabled:bg-sand-100"
                      />
                    </label>
                    <div className="flex items-end gap-3">
                      <div className="text-sm font-semibold text-ink-800">
                        {checkin?.progressScore === null || checkin?.progressScore === undefined
                          ? 'N/A'
                          : `${Number(checkin.progressScore).toFixed(1)}%`}
                      </div>
                      <button
                        disabled={!canEdit || savingId === goal.id}
                        onClick={() => saveGoal(goal)}
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Save
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
