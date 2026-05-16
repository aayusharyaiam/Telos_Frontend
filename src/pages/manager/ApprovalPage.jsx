import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { approveGoalSheet, getGoalSheet, getTeamGoalSheets, returnGoalSheet } from '../../api/goalSheets.api'
import { updateGoal } from '../../api/goals.api'
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
  const [error, setError] = useState('')
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReturn, setConfirmReturn] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const diffRef = useRef(null)

  async function loadSheet() {
    setLoading(true)
    setError('')
    try {
      if (sheetId === 'active') {
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
      setError(err.response?.data?.error?.message || 'Could not update weightage')
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
      setError(err.response?.data?.error?.message || 'Could not update target')
      await loadSheet()
    }
  }

  const handleApprove = async () => {
    if (!sheet) return
    setConfirmApprove(false)
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
    setConfirmReturn(false)
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
          chips={
            <div className="flex items-center gap-2">
              <Badge tone={canApprove ? 'amber' : 'slate'}>{sheet?.status || 'None'}</Badge>
              {editedGoals.length > 0 ? <Badge tone="amber">{editedGoals.length} edited</Badge> : null}
            </div>
          }
          actions={
            <button
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
              {editedGoals.length > 0 ? (
                <button
                  ref={diffRef}
                  onClick={() => setShowDiff(!showDiff)}
                  className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  {showDiff ? 'Hide diff view' : `Show diff view (${editedGoals.length} goal(s) modified)`}
                </button>
              ) : null}
            </div>

            {showDiff && editedGoals.length > 0 ? (
              <div className="rounded-2xl bg-amber-50/80 p-4 shadow-sm ring-1 ring-amber-200">
                <p className="mb-3 text-sm font-semibold text-amber-900">Changes Made (Original → Edited)</p>
                <div className="space-y-2">
                  {editedGoals.map((goal) => {
                    const orig = originals[goal.id]
                    return (
                      <div key={goal.id} className="rounded-xl bg-white px-4 py-3 text-sm">
                        <p className="font-semibold text-ink-900">{goal.title}</p>
                        <div className="mt-1 grid grid-cols-2 gap-4 text-xs">
                          {orig.weightage !== goal.weightage ? (
                            <div>
                              <span className="text-ink-500">Weightage: </span>
                              <span className="text-red-500 line-through">{orig.weightage}%</span>
                              {' → '}
                              <span className="text-accent-600 font-semibold">{goal.weightage}%</span>
                            </div>
                          ) : (
                            <div><span className="text-ink-500">Weightage: </span>{goal.weightage}%</div>
                          )}
                          {orig.target !== goal.target || orig.targetDate !== goal.targetDate ? (
                            <div>
                              <span className="text-ink-500">Target: </span>
                              <span className="text-red-500 line-through">
                                {orig.target ?? orig.targetDate?.slice(0, 10) ?? '--'}
                              </span>
                              {' → '}
                              <span className="text-accent-600 font-semibold">
                                {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
              <div className="border-b border-ink-100 px-6 py-4">
                <p className="text-sm font-semibold text-ink-900">Goals Under Review</p>
              </div>
              <div className="divide-y divide-ink-100">
                {goals.map((goal) => {
                  const isEdited = originals[goal.id] && (
                    originals[goal.id].weightage !== goal.weightage ||
                    originals[goal.id].target !== goal.target ||
                    originals[goal.id].targetDate !== goal.targetDate
                  )
                  return (
                    <div
                      key={goal.id}
                      className={`grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr] ${
                        isEdited ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                          {isEdited ? <Badge tone="amber">Edited</Badge> : null}
                        </div>
                        <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                      </div>
                      <label className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 ${isEdited ? 'bg-amber-100' : 'bg-sand-100'}`}>
                        Target
                        <input
                          type={goal.uomType === 'TIMELINE' ? 'date' : 'number'}
                          value={goalTargetValue(goal)}
                          disabled={!canApprove}
                          onChange={(event) => handleTargetChange(goal, event.target.value)}
                          className="w-28 rounded-lg border border-ink-200 bg-white px-2 py-1 disabled:bg-sand-100"
                        />
                        {isEdited && (
                          originals[goal.id]?.target !== goal.target ||
                          originals[goal.id]?.targetDate !== goal.targetDate
                        ) ? (
                          <span className="ml-2 text-xs text-red-500 line-through">
                            orig: {originals[goal.id]?.target ?? originals[goal.id]?.targetDate?.slice(0, 10) ?? '--'}
                          </span>
                        ) : null}
                      </label>
                      <label className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 ${isEdited ? 'bg-amber-100' : 'bg-sand-100'}`}>
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
                        {isEdited && originals[goal.id]?.weightage !== goal.weightage ? (
                          <span className="ml-1 text-xs text-red-500 line-through">
                            {originals[goal.id]?.weightage}%
                          </span>
                        ) : null}
                      </label>
                    </div>
                  )
                })}
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
                    onClick={() => setConfirmReturn(true)}
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
