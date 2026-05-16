import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAuditReport } from '../../api/reports.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import Badge from '../../components/shared/Badge'

const ACTION_TONES = {
  GOAL_SHEET_UNLOCKED: 'amber',
  GOAL_UNLOCKED: 'amber',
  CYCLE_WINDOW_UPDATED: 'indigo',
  USER_ROLE_CHANGED: 'indigo',
  USER_ACTIVATION_CHANGED: 'red',
  USER_CREATED: 'emerald',
  USER_UPDATED: 'slate',
  THRUST_AREA_CREATED: 'emerald',
  THRUST_AREA_UPDATED: 'slate',
  ESCALATION_RULE_CREATED: 'emerald',
  ESCALATION_RESOLVED: 'emerald',
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  ...Object.keys(ACTION_TONES).map((action) => ({
    value: action,
    label: action.replace(/_/g, ' '),
  })),
]

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

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateInput(d) {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 10)
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterAction, setFilterAction] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  async function load() {
    try {
      setLoading(true)
      const params = {}
      if (filterAction) params.action = filterAction
      if (filterStartDate) params.startDate = filterStartDate
      if (filterEndDate) params.endDate = filterEndDate
      setLogs(await getAuditReport(params))
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filterAction, filterStartDate, filterEndDate])

  const hasFilters = filterAction || filterStartDate || filterEndDate

  const clearFilters = () => {
    setFilterAction('')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Audit Trail"
          subtitle="Track every post-lock edit, role change, and system-level override."
        />

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-5"
        >
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              Action
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              From
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              />
            </label>
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              To
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              />
            </label>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface shadow-sm transition hover:bg-sand-100 dark:hover:bg-dark-bg/30"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <SkeletonPage rows={5} statCards={0} />
        ) : !logs.length ? (
          <EmptyState
            title="No audit logs found"
            description={hasFilters ? 'Try adjusting your filters.' : 'Audit entries will appear as admin actions are performed.'}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                Activity Log ({logs.length})
              </p>
            </div>
            <motion.div
              className="divide-y divide-sand-200/30 dark:divide-outline/10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                  className="px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={ACTION_TONES[log.action] || 'slate'}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                    {log.goal && (
                      <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                        Goal: {log.goal.title}
                      </span>
                    )}
                  </div>

                  {log.fieldChanged && (
                    <p className="mt-1 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                      <span className="font-medium">{log.fieldChanged}</span>
                      {log.oldValue && (
                        <>
                          {' '}
                          <span className="rounded bg-error-container/40 dark:bg-error-container/20 px-1.5 py-0.5 font-body-sm text-body-sm text-error line-through">
                            {log.oldValue}
                          </span>
                        </>
                      )}
                      {log.newValue && (
                        <>
                          {' → '}
                          <span className="rounded bg-secondary/10 dark:bg-secondary/10 px-1.5 py-0.5 font-body-sm text-body-sm text-secondary dark:text-secondary-fixed">
                            {log.newValue}
                          </span>
                        </>
                      )}
                    </p>
                  )}

                  {log.reason && (
                    <p className="mt-1 font-body-sm text-body-sm text-ink-600 dark:text-outline">
                      Reason: <span className="italic">{log.reason}</span>
                    </p>
                  )}

                  <p className="mt-2 font-body-sm text-body-sm text-ink-500 dark:text-outline">
                    {log.user?.name || 'Unknown'} ({log.user?.email || '-'}) — {formatDate(log.createdAt)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
