import { useEffect, useState } from 'react'
import { getCompletionReport } from '../../api/reports.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const statusColor = {
  complete: 'bg-accent-500',
  pending: 'bg-sun-500',
  closed: 'bg-sand-300',
  missed: 'bg-red-500',
}

export default function CompletionDashboardPage() {
  const [quarter, setQuarter] = useState('Q2')
  const [report, setReport] = useState({
    rows: [],
    summary: { total: 0, selectedQuarter: 'Q2', selectedComplete: 0, selectedPercent: 0, quarters: {} },
  })
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setReport(await getCompletionReport({ quarter }))
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Could not load completion report')
      }
    }
    load()
  }, [quarter])

  const selectedSummary = report.summary.quarters?.[quarter] || {
    complete: report.summary.selectedComplete || 0,
    pending: 0,
    percent: report.summary.selectedPercent || 0,
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Completion Dashboard"
          subtitle="Monitor check-in completion across the org in real time."
          actions={
            <select
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm"
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
            >
              {QUARTERS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          }
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Employees" value={String(report.summary.total)} caption="With goal sheets" />
          <StatCard title={`${quarter} Complete`} value={String(selectedSummary.complete)} caption="Manager completed" tone="emerald" />
          <StatCard title={`${quarter} Rate`} value={`${selectedSummary.percent}%`} caption={`${selectedSummary.pending} pending`} />
        </div>

        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <div className="grid gap-4">
            {report.rows.length === 0 ? (
              <p className="text-sm text-ink-600">No completion records yet.</p>
            ) : (
              report.rows.map((row) => (
                <div key={row.userId} className="grid items-center gap-4 md:grid-cols-[1.5fr_repeat(4,_1fr)]">
                  <p className="text-sm font-semibold text-ink-900">{row.name}</p>
                  {QUARTERS.map((rowQuarter) => (
                    <div key={rowQuarter} className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${statusColor[row[rowQuarter]]}`} />
                      <span className="text-xs uppercase text-ink-500">{rowQuarter} {row[rowQuarter]}</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
