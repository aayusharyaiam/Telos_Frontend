import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

const demoGoals = [
  {
    id: 'g1',
    title: 'Grow enterprise ARR to $2.5M',
    thrustArea: 'Revenue Growth',
    weightage: 40,
    status: 'On Track',
    target: '$2.5M',
  },
  {
    id: 'g2',
    title: 'Reduce onboarding time to 7 days',
    thrustArea: 'Operational Excellence',
    weightage: 30,
    status: 'On Track',
    target: '7 days',
  },
  {
    id: 'g3',
    title: 'Launch customer advocacy program',
    thrustArea: 'Customer Satisfaction',
    weightage: 30,
    status: 'Not Started',
    target: 'Q2 launch',
  },
]

export default function MyGoalsPage() {
  const totalWeightage = demoGoals.reduce((sum, goal) => sum + goal.weightage, 0)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="My Goals"
          subtitle="Track goal sheet status, weightage health, and check-in windows in one view."
          actions={
            <>
              <Link
                className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-ink-300"
                to="/goals/sheet/demo"
              >
                View Goal Sheet
              </Link>
              <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
                Create Goal Sheet
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Goal Sheet Status" value="Draft" caption="Awaiting submission" />
          <StatCard
            title="Total Weightage"
            value={`${totalWeightage}%`}
            caption="Target: 100%"
            tone={totalWeightage === 100 ? 'emerald' : 'indigo'}
          />
          <StatCard
            title="Next Window"
            value="Q2 Check-in"
            caption="Opens Oct 1, closes Oct 31"
            tone="emerald"
          />
        </div>

        {demoGoals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Create your first goal sheet to get started with the cycle."
            action={
              <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
                Create Goal Sheet
              </button>
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
              {demoGoals.map((goal) => (
                <div key={goal.id} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                    <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                  </div>
                  <div className="text-sm text-ink-700">Target: {goal.target}</div>
                  <div className="text-sm text-ink-700">Weightage: {goal.weightage}%</div>
                  <div>
                    <Badge tone={goal.status === 'On Track' ? 'emerald' : 'slate'}>
                      {goal.status}
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
