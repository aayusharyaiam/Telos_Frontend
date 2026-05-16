import { useEffect, useState } from 'react'
import { getAdminSummary } from '../../api/reports.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setStats(await getAdminSummary())
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Could not load dashboard data')
      }
    }
    load()
  }, [])

  if (error) {
    return (
      <AppShell>
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </AppShell>
    )
  }

  const s = stats || {}

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Admin Command Center"
          subtitle="Monitor adoption, cycle progress, and org-level performance."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Active Cycle"
            value={s.activeCycleName || '—'}
            caption="Current cycle"
          />
          <StatCard
            title="Active Users"
            value={s.totalActiveUsers ?? '—'}
            caption="Total enrolled"
          />
          <StatCard
            title="Goal Sheets"
            value={s.totalGoalSheets ?? '—'}
            caption={`${s.submittedCount ?? 0} submitted · ${s.approvedCount ?? 0} approved`}
          />
          <StatCard
            title="Q2 Completion"
            value={s.q2CompletionRate != null ? `${s.q2CompletionRate}%` : '—'}
            caption={`${s.q2CompletedCount ?? 0} sheets completed`}
            tone="emerald"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Priority Actions</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700">
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                {s.pendingEscalations ?? 0} pending escalation{(s.pendingEscalations ?? 0) !== 1 ? 's' : ''}
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-400" />
                {s.submittedCount ?? 0} goal sheet{(s.submittedCount ?? 0) !== 1 ? 's' : ''} awaiting approval
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-accent-400" />
                {s.recentAuditCount ?? 0} audit entries this week
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">System Health</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700">
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-accent-500" />
                Database: Connected
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-accent-500" />
                Firebase Auth: Active
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-accent-500" />
                {s.totalActiveUsers ?? 0} active users in system
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
