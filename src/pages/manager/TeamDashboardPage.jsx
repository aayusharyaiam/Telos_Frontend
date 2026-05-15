import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Badge from '../../components/shared/Badge'

const teamMembers = [
  { id: 'e1', name: 'Arjun Sharma', status: 'Submitted', checkin: 'Q2 Open' },
  { id: 'e2', name: 'Nisha Patel', status: 'Approved', checkin: 'Q2 Open' },
  { id: 'e3', name: 'Kabir Rao', status: 'Draft', checkin: 'Pending' },
]

export default function TeamDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Team Overview"
          subtitle="Review submissions, approvals, and check-in completion status across direct reports."
          actions={
            <Link
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
              to="/manager/approve/demo"
            >
              Review Next Sheet
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Goal Sheets" value="8/12" caption="Submitted" />
          <StatCard title="Approvals" value="6" caption="Approved" tone="emerald" />
          <StatCard title="Check-ins" value="52%" caption="Q2 complete" />
        </div>

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Direct Reports</p>
          </div>
          <div className="divide-y divide-ink-100">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{member.name}</p>
                  <p className="text-xs text-ink-500">Goal Sheet: {member.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={member.checkin === 'Q2 Open' ? 'emerald' : 'slate'}>
                    {member.checkin}
                  </Badge>
                  <Link
                    className="text-sm font-semibold text-primary-700"
                    to={`/manager/checkin/${member.id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
