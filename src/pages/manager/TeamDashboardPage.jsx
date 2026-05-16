import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  RETURNED: 'red',
  NOT_STARTED: 'slate',
}

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 },
  }),
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
      <PageHeader
        title="Team Overview"
        subtitle={`Review submissions, approvals, and goal sheet status across direct reports.${cycleName ? ` Active cycle: ${cycleName}.` : ''}`}
        actions={
          nextReview?.goalSheetId ? (
            <Link
              className="inline-flex items-center rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white transition hover:bg-primary hover:scale-[1.02]"
              to={`/manager/approve/${nextReview.goalSheetId}`}
            >
              Review Next Sheet
            </Link>
          ) : null
        }
      />

      {error ? (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl bg-error-container/40 dark:bg-error-container/20 px-4 py-3 font-body-md text-body-md text-error"
        >
          {error}
        </motion.p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Direct Reports" value={loading ? '...' : String(reports.length)} caption="In your team" />
        <StatCard title="Approvals" value={String(approved.length)} caption="Approved" tone="emerald" />
        <StatCard title="Pending Review" value={String(submitted.length)} caption="Submitted" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
      >
        <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Direct Reports</p>
        </div>
        <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
          {reports.length === 0 ? (
            <div className="px-6 py-6 font-body-md text-body-md text-ink-600 dark:text-outline">No direct reports yet.</div>
          ) : (
            reports.map((report, i) => {
              const statusKey = report.goalSheetStatus || 'NOT_STARTED'
              const statusLabel = STATUS_LABELS[statusKey] || 'Not Started'
              const tone = STATUS_TONES[statusKey] || 'slate'

              return (
                <motion.div
                  key={report.userId}
                  custom={i}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{report.name}</p>
                    <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">{report.goalsCount || 0} goals</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={tone}>{statusLabel}</Badge>
                    {report.goalSheetStatus === 'APPROVED' ? (
                      <Link
                        className="font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:underline"
                        to={`/manager/checkin/${report.userId}`}
                      >
                        Check-in
                      </Link>
                    ) : null}
                    {report.goalSheetId ? (
                      <Link
                        className="font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:underline"
                        to={`/manager/approve/${report.goalSheetId}`}
                      >
                        Review
                      </Link>
                    ) : (
                      <span className="font-label-bold text-label-bold text-ink-400 dark:text-outline">No sheet yet</span>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>
    </AppShell>
  )
}
