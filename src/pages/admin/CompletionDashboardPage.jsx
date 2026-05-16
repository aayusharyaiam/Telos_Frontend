import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
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
              className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 font-body-md text-body-md"
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
            >
              {QUARTERS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          }
        />

        {error ? <p className="rounded-xl bg-error-container/40 dark:bg-error-container/20 px-4 py-3 font-body-md text-body-md text-error">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Employees" value={String(report.summary.total)} caption="With goal sheets" />
          <StatCard title={`${quarter} Complete`} value={String(selectedSummary.complete)} caption="Manager completed" tone="emerald" />
          <StatCard title={`${quarter} Rate`} value={`${selectedSummary.percent}%`} caption={`${selectedSummary.pending} pending`} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <motion.div
            className="grid gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {report.rows.length === 0 ? (
              <p className="font-body-md text-body-md text-ink-600 dark:text-outline">No completion records yet.</p>
            ) : (
              report.rows.map((row) => (
                <motion.div
                  key={row.userId}
                  variants={itemVariants}
                  className="grid items-center gap-4 md:grid-cols-[1.5fr_repeat(4,_1fr)] hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors rounded-xl px-3 py-2"
                >
                  <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{row.name}</p>
                  {QUARTERS.map((rowQuarter) => (
                    <div key={rowQuarter} className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${statusColor[row[rowQuarter]]}`} />
                      <span className="font-label-bold text-label-bold uppercase text-ink-500 dark:text-outline">{rowQuarter} {row[rowQuarter]}</span>
                    </div>
                  ))}
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    </AppShell>
  )
}
