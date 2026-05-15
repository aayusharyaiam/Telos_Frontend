import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const approvalGoals = [
  {
    id: 'g1',
    title: 'Grow enterprise ARR to $2.5M',
    originalTarget: '$2.2M',
    managerTarget: '$2.5M',
    originalWeightage: 35,
    managerWeightage: 40,
  },
  {
    id: 'g2',
    title: 'Reduce onboarding time to 7 days',
    originalTarget: '8 days',
    managerTarget: '7 days',
    originalWeightage: 30,
    managerWeightage: 30,
  },
  {
    id: 'g3',
    title: 'Launch customer advocacy program',
    originalTarget: 'Q3',
    managerTarget: 'Q2',
    originalWeightage: 35,
    managerWeightage: 30,
  },
]

export default function ApprovalPage() {
  const totalWeightage = approvalGoals.reduce(
    (sum, goal) => sum + goal.managerWeightage,
    0
  )

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Approval Review"
          subtitle="Review manager edits, adjust weightage, and submit approval feedback."
          chips={<Badge tone="amber">Submitted</Badge>}
          actions={
            <>
              <button className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700">
                Return with Reason
              </button>
              <button
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={totalWeightage !== 100}
              >
                Approve Goal Sheet
              </button>
            </>
          }
        />

        <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-ink-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">Total Weightage</p>
            <Badge tone={totalWeightage === 100 ? 'emerald' : 'amber'}>
              {totalWeightage}%
            </Badge>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Manager-edited values are highlighted to the right.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Goals Under Review</p>
          </div>
          <div className="divide-y divide-ink-100">
            {approvalGoals.map((goal) => (
              <div key={goal.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                  <p className="text-xs text-ink-500">Original Target: {goal.originalTarget}</p>
                </div>
                <div className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-700">
                  Manager Target: {goal.managerTarget}
                </div>
                <div className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-700">
                  Weightage: {goal.managerWeightage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
