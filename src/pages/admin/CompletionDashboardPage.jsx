import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'

const completion = [
  { name: 'Arjun Sharma', Q1: 'complete', Q2: 'pending', Q3: 'closed', Q4: 'closed' },
  { name: 'Nisha Patel', Q1: 'complete', Q2: 'complete', Q3: 'closed', Q4: 'closed' },
  { name: 'Kabir Rao', Q1: 'missed', Q2: 'pending', Q3: 'closed', Q4: 'closed' },
]

const statusColor = {
  complete: 'bg-accent-500',
  pending: 'bg-sun-500',
  closed: 'bg-sand-300',
  missed: 'bg-red-500',
}

export default function CompletionDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Completion Dashboard"
          subtitle="Monitor check-in completion across the org in real time." 
        />

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <div className="grid gap-4">
            {completion.map((row) => (
              <div key={row.name} className="grid items-center gap-4 md:grid-cols-[1.5fr_repeat(4,_1fr)]">
                <p className="text-sm font-semibold text-ink-900">{row.name}</p>
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                  <div key={quarter} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${statusColor[row[quarter]]}`} />
                    <span className="text-xs uppercase text-ink-500">{quarter}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
