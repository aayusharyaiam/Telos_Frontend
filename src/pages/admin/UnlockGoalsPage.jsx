import { useEffect, useState } from 'react'
import { getTeamGoalSheets, unlockGoalSheet, unlockGoal } from '../../api/goalSheets.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

const STATUS_TONES = {
  DRAFT: 'slate',
  SUBMITTED: 'amber',
  APPROVED: 'emerald',
  RETURNED: 'red',
}

export default function UnlockGoalsPage() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Sheet-level unlock
  const [unlockTarget, setUnlockTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  // Goal-level unlock
  const [goalUnlockTarget, setGoalUnlockTarget] = useState(null)
  const [goalReason, setGoalReason] = useState('')
  const [goalUnlocking, setGoalUnlocking] = useState(false)

  // Expanded sheet to show individual goals
  const [expandedSheetId, setExpandedSheetId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      setSheets(await getTeamGoalSheets())
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load goal sheets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = sheets.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    )
  })

  const handleUnlock = async () => {
    if (!unlockTarget || reason.length < 5) return
    try {
      setUnlocking(true)
      await unlockGoalSheet(unlockTarget.id, reason)
      setUnlockTarget(null)
      setReason('')
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to unlock')
    } finally {
      setUnlocking(false)
    }
  }

  const handleGoalUnlock = async () => {
    if (!goalUnlockTarget || goalReason.length < 5) return
    try {
      setGoalUnlocking(true)
      await unlockGoal(goalUnlockTarget.id, goalReason)
      setGoalUnlockTarget(null)
      setGoalReason('')
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to unlock goal')
    } finally {
      setGoalUnlocking(false)
    }
  }

  const toggleExpanded = (sheetId) => {
    setExpandedSheetId((prev) => (prev === sheetId ? null : sheetId))
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Goal Sheet Unlock"
          subtitle="Unlock approved/locked goal sheets or individual goals for employees to edit and resubmit."
        />

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee name or email..."
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />

        {/* Sheet Unlock Modal */}
        {unlockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-ink-900">
                Unlock Goal Sheet
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                Unlocking <strong>{unlockTarget.user?.name}</strong>&apos;s goal sheet.
                This will set the sheet to RETURNED and unlock all goals.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter unlock reason (min 5 chars)..."
                rows={3}
                className="mt-4 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => { setUnlockTarget(null); setReason('') }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlock}
                  disabled={unlocking || reason.length < 5}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {unlocking ? 'Unlocking...' : 'Confirm Unlock'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Unlock Modal */}
        {goalUnlockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-ink-900">
                Unlock Individual Goal
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                Unlocking goal: <strong>{goalUnlockTarget.title}</strong>
              </p>
              <textarea
                value={goalReason}
                onChange={(e) => setGoalReason(e.target.value)}
                placeholder="Enter unlock reason (min 5 chars)..."
                rows={3}
                className="mt-4 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => { setGoalUnlockTarget(null); setGoalReason('') }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-sand-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGoalUnlock}
                  disabled={goalUnlocking || goalReason.length < 5}
                  className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {goalUnlocking ? 'Unlocking...' : 'Unlock Goal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sheets List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-ink-500">Loading goal sheets...</div>
        ) : !filtered.length ? (
          <EmptyState
            title={search ? 'No matching sheets' : 'No goal sheets found'}
            description={search ? 'Try a different search term.' : 'Goal sheets will appear once employees create them.'}
          />
        ) : (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">
                Goal Sheets ({filtered.length})
              </p>
            </div>
            <div className="divide-y divide-ink-100">
              {filtered.map((sheet) => (
                <div key={sheet.id}>
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">
                          {sheet.user?.name}
                        </p>
                        <Badge tone={STATUS_TONES[sheet.status] || 'slate'}>
                          {sheet.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-500">
                        {sheet.user?.email} · {sheet.goals?.length || 0} goals
                        {sheet.status === 'APPROVED' && ' · Locked'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sheet.status === 'APPROVED' && sheet.goals?.some((g) => g.isLocked) && (
                        <button
                          onClick={() => toggleExpanded(sheet.id)}
                          className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-sand-100"
                        >
                          {expandedSheetId === sheet.id ? 'Hide Goals' : 'Per-Goal Unlock'}
                        </button>
                      )}
                      {sheet.status === 'APPROVED' && (
                        <button
                          onClick={() => setUnlockTarget(sheet)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
                        >
                          🔓 Unlock All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Per-goal unlock detail */}
                  {expandedSheetId === sheet.id && sheet.goals?.length > 0 && (
                    <div className="border-t border-ink-50 bg-sand-50 px-6 py-3">
                      <p className="text-xs font-semibold text-ink-600 mb-2">Individual Goals</p>
                      <div className="space-y-2">
                        {sheet.goals.map((goal) => (
                          <div key={goal.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-ink-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                                {goal.isShared && <Badge tone="indigo">Shared</Badge>}
                                <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>
                                  {goal.isLocked ? 'Locked' : 'Unlocked'}
                                </Badge>
                              </div>
                              <p className="text-xs text-ink-500">{goal.thrustArea} · Weightage: {goal.weightage}%</p>
                            </div>
                            {goal.isLocked && (
                              <button
                                onClick={() => setGoalUnlockTarget(goal)}
                                className="rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
                              >
                                🔓 Unlock
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
