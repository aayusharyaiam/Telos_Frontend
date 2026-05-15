import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const initialGoals = [
  {
    id: 'g1',
    title: 'Grow enterprise ARR to $2.5M',
    thrustArea: 'Revenue Growth',
    uom: 'NUMERIC_MIN',
    target: '2.5M',
    weightage: 40,
  },
  {
    id: 'g2',
    title: 'Reduce onboarding time to 7 days',
    thrustArea: 'Operational Excellence',
    uom: 'NUMERIC_MAX',
    target: '7',
    weightage: 30,
  },
  {
    id: 'g3',
    title: 'Launch customer advocacy program',
    thrustArea: 'Customer Satisfaction',
    uom: 'TIMELINE',
    target: '2026-03-30',
    weightage: 30,
  },
]

export default function GoalSheetPage() {
  const [goals, setGoals] = useState(initialGoals)
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
  const weightageColor =
    totalWeightage === 100 ? 'bg-accent-500' : totalWeightage > 100 ? 'bg-red-500' : 'bg-primary-500'

  const handleWeightageChange = (id, value) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, weightage: Number(value) } : goal))
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Goal Sheet"
          subtitle="Adjust weightages, targets, and final details before submitting for approval."
          chips={<Badge tone="indigo">Draft</Badge>}
          actions={
            <>
              <button className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700">
                Save Draft
              </button>
              <button
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={totalWeightage !== 100}
              >
                Submit for Approval
              </button>
            </>
          }
        />

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

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Goals ({goals.length})</p>
          </div>
          <div className="divide-y divide-ink-100">
            {goals.map((goal) => (
              <div key={goal.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                  <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                </div>
                <div className="text-sm text-ink-700">UoM: {goal.uom}</div>
                <div className="text-sm text-ink-700">Target: {goal.target}</div>
                <label className="flex items-center gap-2 text-sm text-ink-700">
                  Weightage
                  <input
                    type="number"
                    min="10"
                    value={goal.weightage}
                    onChange={(event) => handleWeightageChange(goal.id, event.target.value)}
                    className="w-20 rounded-lg border border-ink-200 bg-white px-2 py-1 text-sm"
                  />
                  %
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
