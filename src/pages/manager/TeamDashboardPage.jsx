import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamGoalSheets } from '../../api/goalSheets.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Badge from '../../components/shared/Badge'

export default function TeamDashboardPage() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        setSheets(await getTeamGoalSheets())
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Could not load team')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const submitted = sheets.filter((sheet) => sheet.status === 'SUBMITTED')
  const approved = sheets.filter((sheet) => sheet.status === 'APPROVED')
  const nextSheet = submitted[0] || sheets[0]

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Team Overview"
          subtitle="Review submissions, approvals, and goal sheet status across direct reports."
          actions={
            nextSheet ? (
              <Link
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                to={`/manager/approve/${nextSheet.id}`}
              >
                Review Next Sheet
              </Link>
            ) : null
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Goal Sheets" value={loading ? '...' : String(sheets.length)} caption="In active cycle" />
          <StatCard title="Approvals" value={String(approved.length)} caption="Approved" tone="emerald" />
          <StatCard title="Pending Review" value={String(submitted.length)} caption="Submitted" />
        </div>

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Direct Reports</p>
          </div>
          <div className="divide-y divide-ink-100">
            {sheets.length === 0 ? (
              <div className="px-6 py-6 text-sm text-ink-600">No team goal sheets yet.</div>
            ) : (
              sheets.map((sheet) => (
                <div key={sheet.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{sheet.user.name}</p>
                    <p className="text-xs text-ink-500">{sheet.goals.length} goals</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={sheet.status === 'APPROVED' ? 'emerald' : sheet.status === 'SUBMITTED' ? 'amber' : 'slate'}>
                      {sheet.status}
                    </Badge>
                    <Link
                      className="text-sm font-semibold text-primary-700"
                      to={`/manager/approve/${sheet.id}`}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
