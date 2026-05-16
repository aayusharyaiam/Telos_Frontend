import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getEmailLogs } from '../../api/admin.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/shared/EmptyState'
import Badge from '../../components/shared/Badge'

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const STATUS_MAP = {
  true: { label: 'Sent', tone: 'emerald' },
  false: { label: 'Failed', tone: 'red' },
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

export default function EmailLogPage() {
  const [data, setData] = useState({ logs: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  async function load() {
    try {
      setLoading(true)
      setData(await getEmailLogs(page, 50))
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load email logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const { logs, pagination } = data

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Email Logs"
          subtitle="Every email sent by the system. Delivery status reflects the Resend API response."
        />

        {loading ? (
          <SkeletonPage rows={5} statCards={0} />
        ) : !logs.length ? (
          <EmptyState
            title="No emails sent yet"
            description="Email logs will appear here once the system sends notifications."
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
            >
              <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
                <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                  Sent Emails ({pagination?.total || logs.length})
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
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge tone={STATUS_MAP[log.success].tone}>
                        {STATUS_MAP[log.success].label}
                      </Badge>
                      <Badge tone="indigo">{log.eventType}</Badge>
                    </div>
                    <p className="font-body-md text-body-md font-medium text-ink-900 dark:text-inverse-on-surface">
                      {log.subject}
                    </p>
                    <p className="font-body-sm text-body-sm text-ink-600 dark:text-outline">
                      To: {log.to}
                    </p>
                    <details className="mt-1">
                      <summary className="cursor-pointer font-body-sm text-body-sm text-primary dark:text-primary-fixed-dim">
                        Show content
                      </summary>
                      <div
                        className="mt-2 rounded-xl bg-sand-50 dark:bg-dark-surface/50 p-3 font-body-sm text-body-sm text-ink-700 dark:text-inverse-on-surface overflow-auto max-h-60 border border-sand-200/50 dark:border-outline/20"
                        dangerouslySetInnerHTML={{ __html: log.html }}
                      />
                    </details>
                    {log.error && (
                      <p className="mt-1 font-body-sm text-body-sm text-error">
                        Error: {log.error}
                      </p>
                    )}
                    <p className="mt-2 font-body-sm text-body-sm text-ink-500 dark:text-outline">
                      {formatDate(log.createdAt)}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface shadow-sm transition hover:bg-sand-100 dark:hover:bg-dark-bg/30 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2 text-sm font-semibold text-ink-700 dark:text-inverse-on-surface shadow-sm transition hover:bg-sand-100 dark:hover:bg-dark-bg/30 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
