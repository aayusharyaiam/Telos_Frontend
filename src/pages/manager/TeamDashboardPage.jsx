import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamOverview } from '../../api/goalSheets.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import Badge from '../../components/shared/Badge'

const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  RETURNED: 'Returned',
}

const STATUS_TONES = {
  DRAFT: 'slate',
  SUBMITTED: 'amber',
  APPROVED: 'emerald',
  RETURNED: 'rose',
  NOT_STARTED: 'slate',
}

export default function TeamDashboardPage() {
  const [reports, setReports] = useState([])
  const [cycleName, setCycleName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const payload = await getTeamOverview()
        setReports(payload.reports || [])
        setCycleName(payload.cycleName || '')
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Could not load team')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const submitted = reports.filter((report) => report.goalSheetStatus === 'SUBMITTED')
  const approved = reports.filter((report) => report.goalSheetStatus === 'APPROVED')
  const nextReview =
    reports.find((report) => report.goalSheetStatus === 'SUBMITTED') ||
    reports.find((report) => report.goalSheetId)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Team Overview"
          subtitle={`Review submissions, approvals, and goal sheet status across direct reports.${
            cycleName ? ` Active cycle: ${cycleName}.` : ''
          }`}
          actions={
            nextReview?.goalSheetId ? (
              <Link
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                to={`/manager/approve/${nextReview.goalSheetId}`}
              >
                Review Next Sheet
              </Link>
            ) : null
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Direct Reports" value={loading ? '...' : String(reports.length)} caption="In your team" />
          <StatCard title="Approvals" value={String(approved.length)} caption="Approved" tone="emerald" />
          <StatCard title="Pending Review" value={String(submitted.length)} caption="Submitted" />
        </div>

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">Direct Reports</p>
          </div>
          <div className="divide-y divide-ink-100">
            {reports.length === 0 ? (
              <div className="px-6 py-6 text-sm text-ink-600">No direct reports yet.</div>
            ) : (
              reports.map((report) => {
                const statusKey = report.goalSheetStatus || 'NOT_STARTED'
                const statusLabel = STATUS_LABELS[statusKey] || 'Not Started'
                const tone = STATUS_TONES[statusKey] || 'slate'

                return (
                  <div key={report.userId} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{report.name}</p>
                      <p className="text-xs text-ink-500">{report.goalsCount || 0} goals</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={tone}>{statusLabel}</Badge>
                      {report.goalSheetStatus === 'APPROVED' ? (
                        <Link
                          className="text-sm font-semibold text-primary-700"
                          to={`/manager/checkin/${report.userId}`}
                        >
                          Check-in
                        </Link>
                      ) : null}
                      {report.goalSheetId ? (
                        <Link
                          className="text-sm font-semibold text-primary-700"
                          to={`/manager/approve/${report.goalSheetId}`}
                        >
                          Review
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-ink-400">No sheet yet</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
