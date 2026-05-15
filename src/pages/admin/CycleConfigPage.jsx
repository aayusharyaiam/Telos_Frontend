import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const windows = [
  { phase: 'Goal Setting', opens: 'May 1', closes: 'May 31', status: 'FORCE_OPEN' },
  { phase: 'Q1 Check-in', opens: 'Jul 1', closes: 'Jul 31', status: 'FORCE_OPEN' },
  { phase: 'Q2 Check-in', opens: 'Oct 1', closes: 'Oct 31', status: 'OPEN' },
  { phase: 'Q3 Check-in', opens: 'Jan 1', closes: 'Jan 31', status: 'CLOSED' },
  { phase: 'Q4 Check-in', opens: 'Mar 1', closes: 'Apr 30', status: 'CLOSED' },
]

export default function CycleConfigPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Cycle Configuration"
          subtitle="Force-open or close windows to manage demo and exception flows."
          actions={
            <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white">
              Create New Cycle
            </button>
          }
        />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">FY2025-26 Windows</p>
          </div>
          <div className="divide-y divide-ink-100">
            {windows.map((window) => (
              <div key={window.phase} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{window.phase}</p>
                  <p className="text-xs text-ink-500">
                    {window.opens} - {window.closes}
                  </p>
                </div>
                <div>
                  <Badge tone={window.status === 'OPEN' || window.status === 'FORCE_OPEN' ? 'emerald' : 'slate'}>
                    {window.status}
                  </Badge>
                </div>
                <button className="text-left text-sm font-semibold text-primary-700">Force Open</button>
                <button className="text-left text-sm font-semibold text-ink-600">Force Close</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
