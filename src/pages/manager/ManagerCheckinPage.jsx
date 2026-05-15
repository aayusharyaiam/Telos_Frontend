import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const checkinRows = [
  {
    id: 'g1',
    title: 'Grow enterprise ARR to $2.5M',
    planned: '$2.5M',
    actual: '$1.6M',
    status: 'On Track',
    score: '64%'
  },
  {
    id: 'g2',
    title: 'Reduce onboarding time to 7 days',
    planned: '7 days',
    actual: '9 days',
    status: 'On Track',
    score: '78%'
  },
]

export default function ManagerCheckinPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Manager Check-in"
          subtitle="Review planned vs actual performance and record check-in commentary."
          chips={<Badge tone="emerald">Q2 Window Open</Badge>}
        />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Employee Goals</p>
          </div>
          <div className="divide-y divide-ink-100">
            {checkinRows.map((row) => (
              <div key={row.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{row.title}</p>
                  <p className="text-xs text-ink-500">Planned: {row.planned}</p>
                </div>
                <div className="text-sm text-ink-700">Actual: {row.actual}</div>
                <div>
                  <Badge tone="emerald">{row.status}</Badge>
                </div>
                <div className="text-sm font-semibold text-ink-800">{row.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <label className="grid gap-2 text-sm font-semibold text-ink-700">
            Manager Comment
            <textarea
              rows={4}
              className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="Summarize check-in observations, risks, and next actions."
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              Submit Check-in
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
