import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { approveGoalSheet, getGoalSheet, getTeamGoalSheets, returnGoalSheet } from '../../api/goalSheets.api'
import { updateGoal } from '../../api/goals.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

export default function ApprovalPage() {
  const { sheetId } = useParams()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadSheet() {
    setLoading(true)
    setError('')
    try {
      if (sheetId === 'demo') {
        const team = await getTeamGoalSheets()
        setSheet(team.find((item) => item.status === 'SUBMITTED') || team[0] || null)
      } else {
        setSheet(await getGoalSheet(sheetId))
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load approval sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet()
  }, [sheetId])

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const canApprove = sheet?.status === 'SUBMITTED'

  const handleWeightageChange = async (goal, value) => {
    setSheet((prev) => ({
      ...prev,
      goals: prev.goals.map((item) => (item.id === goal.id ? { ...item, weightage: value } : item)),
    }))
    try {
      await updateGoal(goal.id, { weightage: value })
      await loadSheet()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update weightage')
      await loadSheet()
    }
  }

  const handleApprove = async () => {
    if (!sheet) return
    setSaving(true)
    setError('')
    try {
      setSheet(await approveGoalSheet(sheet.id))
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not approve goal sheet')
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async () => {
    if (!sheet) return
    setSaving(true)
    setError('')
    try {
      await returnGoalSheet(sheet.id, reason)
      navigate('/manager/team')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not return goal sheet')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-ink-600">Loading approval sheet...</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Approval Review"
          subtitle={sheet ? `Reviewing ${sheet.user.name}'s goal sheet.` : 'No sheet selected.'}
          chips={<Badge tone={canApprove ? 'amber' : 'slate'}>{sheet?.status || 'None'}</Badge>}
          actions={
            <button
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={!canApprove || saving || totalWeightage !== 100}
              onClick={handleApprove}
            >
              Approve Goal Sheet
            </button>
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {!sheet ? (
          <p className="text-sm text-ink-600">There are no team goal sheets to review yet.</p>
        ) : (
          <>
            <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-ink-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">Total Weightage</p>
                <Badge tone={totalWeightage === 100 ? 'emerald' : 'amber'}>
                  {totalWeightage}%
                </Badge>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Managers can adjust weightage while the sheet is submitted.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
              <div className="border-b border-ink-100 px-6 py-4">
                <p className="text-sm font-semibold text-ink-900">Goals Under Review</p>
              </div>
              <div className="divide-y divide-ink-100">
                {goals.map((goal) => (
                  <div key={goal.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr]">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                      <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                    </div>
                    <div className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-700">
                      Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                    </div>
                    <label className="flex items-center gap-2 rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-700">
                      Weightage
                      <input
                        type="number"
                        min="10"
                        value={goal.weightage}
                        disabled={!canApprove}
                        onChange={(event) => handleWeightageChange(goal, Number(event.target.value))}
                        className="w-20 rounded-lg border border-ink-200 bg-white px-2 py-1 disabled:bg-sand-100"
                      />
                      %
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {canApprove ? (
              <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
                <label className="grid gap-2 text-sm font-semibold text-ink-700">
                  Return Reason
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
                    placeholder="Explain what the employee should revise before resubmitting."
                  />
                </label>
                <div className="mt-4 flex justify-end">
                  <button
                    className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-60"
                    disabled={saving || reason.trim().length < 20}
                    onClick={handleReturn}
                  >
                    Return with Reason
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  )
}
