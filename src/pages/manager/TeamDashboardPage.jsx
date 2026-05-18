import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
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

export default function TeamDashboardPage({ view = 'team' }) {
  const [reports, setReports] = useState([])
  const [cycleName, setCycleName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const payload = await getTeamOverview()
        setReports(payload.reports || [])
        setCycleName(payload.cycleName || '')
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Could not load team')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const submitted = reports.filter((report) => report.goalSheetStatus === 'SUBMITTED')
  const approved = reports.filter((report) => report.goalSheetStatus === 'APPROVED')
  const draft = reports.filter((report) => report.goalSheetStatus === 'DRAFT' || !report.goalSheetStatus)
  const returned = reports.filter((report) => report.goalSheetStatus === 'RETURNED')
  const totalGoals = reports.reduce((sum, report) => sum + (report.goalsCount || 0), 0)
  const nextReview =
    reports.find((report) => report.goalSheetStatus === 'SUBMITTED') ||
    reports.find((report) => report.goalSheetId)

  const isApprovalsView = view === 'approvals'
  const isCheckinsView = view === 'checkins'

  const pageTitle = isApprovalsView ? 'Pending Approvals' : isCheckinsView ? 'Team Check-ins' : 'Team Overview'
  const pageSubtitle = isApprovalsView 
    ? `Review and approve goal sheets from direct reports.${cycleName ? ` Active cycle: ${cycleName}.` : ''}`
    : isCheckinsView 
    ? `Monitor quarterly check-in progress across your team.${cycleName ? ` Active cycle: ${cycleName}.` : ''}`
    : `Review submissions, approvals, and goal sheet status across direct reports.${cycleName ? ` Active cycle: ${cycleName}.` : ''}`

  const filteredReports = isApprovalsView ? submitted : isCheckinsView ? approved : reports
  const emptyMessage = isApprovalsView ? 'No pending approvals.' : isCheckinsView ? 'No approved sheets yet for check-ins.' : 'No direct reports yet.'

  return (
    <AppShell>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          !isCheckinsView && nextReview?.goalSheetId ? (
            <Link
              className="inline-flex items-center rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white transition hover:bg-primary hover:scale-[1.02]"
              to={`/manager/approve/${nextReview.goalSheetId}`}
            >
              Review Next Sheet
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Team Members" value={loading ? '...' : String(reports.length)} caption="Direct reports" tone="emerald" />
        <StatCard title="Total Goals" value={String(totalGoals)} caption={`${reports.length} sheets`} tone="indigo" />
        <StatCard title="Draft" value={String(draft.length)} caption="In progress" tone="slate" />
        <StatCard title="Submitted" value={String(submitted.length)} caption="Awaiting review" tone="amber" />
        <StatCard title="Approved" value={String(approved.length)} caption="Completed" tone="emerald" />
        <StatCard title="Returned" value={String(returned.length)} caption="Needs revision" tone="red" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
      >
        <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
            {isApprovalsView ? 'Pending Approval' : isCheckinsView ? 'Approved Sheets' : 'Direct Reports'}
          </p>
        </div>
        <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
          {filteredReports.length === 0 ? (
            <div className="px-6 py-6 font-body-md text-body-md text-ink-600 dark:text-outline">{emptyMessage}</div>
          ) : (
            filteredReports.map((report, i) => {
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
                    {isCheckinsView ? (
                      <Link
                        className="font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:underline"
                        to={`/manager/checkin/${report.userId}`}
                      >
                        View Check-ins
                      </Link>
                    ) : isApprovalsView ? (
                      <Link
                        className="font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:underline"
                        to={`/manager/approve/${report.goalSheetId}`}
                      >
                        Review
                      </Link>
                    ) : (
                      <>
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
                      </>
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
