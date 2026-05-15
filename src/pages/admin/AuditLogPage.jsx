import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'

const logs = [
  {
    id: 'l1',
    action: 'GOAL_UNLOCKED',
    user: 'Rahul Gupta',
    detail: 'Unlocked goal g3 for Arjun Sharma',
    time: '2026-05-12 09:10',
  },
  {
    id: 'l2',
    action: 'CYCLE_UPDATED',
    user: 'Rahul Gupta',
    detail: 'Forced Q2 window open',
    time: '2026-05-10 14:22',
  },
]

export default function AuditLogPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Audit Trail"
          subtitle="Track every post-lock edit and system-level override." 
        />

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Recent Activity</p>
          </div>
          <div className="divide-y divide-ink-100">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <p className="text-sm font-semibold text-ink-900">{log.action}</p>
                <p className="text-xs text-ink-500">{log.detail}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {log.user} - {log.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
