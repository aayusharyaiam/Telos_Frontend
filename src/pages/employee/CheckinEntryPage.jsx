import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import { computeScore } from '../../utils/scoreComputer'

const checkinGoals = [
  {
    id: 'g1',
    title: 'Grow enterprise ARR to $2.5M',
    thrustArea: 'Revenue Growth',
    target: 2.5,
    actual: 1.6,
    uomType: 'NUMERIC_MIN',
    status: 'On Track',
  },
  {
    id: 'g2',
    title: 'Reduce onboarding time to 7 days',
    thrustArea: 'Operational Excellence',
    target: 7,
    actual: 9,
    uomType: 'NUMERIC_MAX',
    status: 'On Track',
  },
  {
    id: 'g3',
    title: 'Launch customer advocacy program',
    thrustArea: 'Customer Satisfaction',
    targetDate: '2026-03-30',
    actualDate: null,
    uomType: 'TIMELINE',
    status: 'Not Started',
  },
]

export default function CheckinEntryPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Q2 Check-in"
          subtitle="Capture achievements to date. Entries are cumulative per quarter."
          chips={<Badge tone="emerald">Window Open</Badge>}
        />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Achievement Entry</p>
          </div>
          <div className="divide-y divide-ink-100">
            {checkinGoals.map((goal) => {
              const score = computeScore({
                uomType: goal.uomType,
                target: goal.target,
                actual: goal.actual,
                targetDate: goal.targetDate,
                actualDate: goal.actualDate,
              })

              return (
                <div key={goal.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                    <p className="text-xs text-ink-500">{goal.thrustArea}</p>
                  </div>
                  <div className="text-sm text-ink-700">
                    Actual: {goal.actual ?? goal.actualDate ?? '--'}
                  </div>
                  <div>
                    <Badge tone={goal.status === 'On Track' ? 'emerald' : 'slate'}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-ink-800">
                    {score === null ? 'N/A' : `${score.toFixed(1)}%`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
