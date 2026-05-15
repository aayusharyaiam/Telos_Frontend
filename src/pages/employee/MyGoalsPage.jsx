import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createGoalSheet, getMyGoalSheet } from '../../api/goalSheets.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

export default function MyGoalsPage() {
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadSheet() {
    setLoading(true)
    setError('')
    try {
      setSheet(await getMyGoalSheet())
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load goal sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheet()
  }, [])

  const handleCreate = async () => {
    setError('')
    try {
      const nextSheet = await createGoalSheet()
      setSheet(nextSheet)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not create goal sheet')
    }
  }

  const goals = sheet?.goals || []
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const nextSheetLink = sheet ? `/goals/sheet/${sheet.id}` : '/goals/sheet/active'

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="My Goals"
          subtitle="Track goal sheet status, weightage health, and check-in windows in one view."
          actions={
            <>
              {sheet ? (
                <Link
                  className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ink-300"
                  to={nextSheetLink}
                >
                  View Goal Sheet
                </Link>
              ) : null}
              <button
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                disabled={Boolean(sheet) || loading}
                onClick={handleCreate}
              >
                Create Goal Sheet
              </button>
            </>
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Goal Sheet Status" value={loading ? 'Loading' : sheet?.status || 'Not Created'} caption={sheet?.cycle?.name || 'Active cycle'} />
          <StatCard
            title="Total Weightage"
            value={`${totalWeightage}%`}
            caption="Target: 100%"
            tone={totalWeightage === 100 ? 'emerald' : 'indigo'}
          />
          <StatCard
            title="Goals"
            value={String(goals.length)}
            caption="Maximum 8 goals"
            tone="emerald"
          />
        </div>

        {!sheet ? (
          <EmptyState
            title="No goal sheet yet"
            description="Create your goal sheet to start adding goals for the active cycle."
            action={
              <button
                onClick={handleCreate}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Create Goal Sheet
              </button>
            }
          />
        ) : goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Open the goal sheet and add at least one goal before submitting."
            action={
              <Link
                to={nextSheetLink}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Add Goals
              </Link>
            }
          />
        ) : (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">Active Goals</p>
              <Badge tone={totalWeightage === 100 ? 'emerald' : 'amber'}>
                Total {totalWeightage}%
              </Badge>
            </div>
            <div className="divide-y divide-ink-100">
              {goals.map((goal) => (
                <div key={goal.id} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                    <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                  </div>
                  <div className="text-sm text-ink-700">
                    Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                  </div>
                  <div className="text-sm text-ink-700">Weightage: {goal.weightage}%</div>
                  <div>
                    <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>
                      {goal.isLocked ? 'Locked' : sheet.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
