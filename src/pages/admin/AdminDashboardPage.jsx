import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'

export default function AdminDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Admin Command Center"
          subtitle="Monitor adoption, cycle progress, and org-level performance." 
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Active Cycle" value="FY2025-26" caption="Force-open windows" />
          <StatCard title="Goal Sheets" value="78%" caption="Submitted across org" />
          <StatCard title="Check-ins" value="62%" caption="Q2 completed" tone="emerald" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Priority Actions</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700">
              <li>5 managers have overdue approvals</li>
              <li>12 employees missing Q2 check-ins</li>
              <li>2 goal sheets unlocked this week</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">System Health</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700">
              <li>Supabase: Connected</li>
              <li>Firebase Auth: Active</li>
              <li>Resend: 122 emails sent this cycle</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
