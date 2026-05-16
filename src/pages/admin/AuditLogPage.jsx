import { useEffect, useState } from 'react'
import { getAuditReport } from '../../api/reports.api'
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
  const [error, setError] = useState('')

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
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load audit logs')
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

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Filter Controls */}
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-ink-100">
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              Action
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              From
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              To
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              />
            </label>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-sand-100"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-ink-500">Loading audit logs...</div>
        ) : !logs.length ? (
          <EmptyState
            title="No audit logs found"
            description={hasFilters ? 'Try adjusting your filters.' : 'Audit entries will appear as admin actions are performed.'}
          />
        ) : (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">
                Activity Log ({logs.length})
              </p>
            </div>
            <div className="divide-y divide-ink-100">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={ACTION_TONES[log.action] || 'slate'}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                    {log.goal && (
                      <span className="text-xs text-ink-500">
                        Goal: {log.goal.title}
                      </span>
                    )}
                  </div>

                  {log.fieldChanged && (
                    <p className="mt-1 text-sm text-ink-700">
                      <span className="font-medium">{log.fieldChanged}</span>
                      {log.oldValue && (
                        <>
                          {' '}
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700 line-through">
                            {log.oldValue}
                          </span>
                        </>
                      )}
                      {log.newValue && (
                        <>
                          {' → '}
                          <span className="rounded bg-accent-50 px-1.5 py-0.5 text-xs text-accent-700">
                            {log.newValue}
                          </span>
                        </>
                      )}
                    </p>
                  )}

                  {log.reason && (
                    <p className="mt-1 text-xs text-ink-600">
                      Reason: <span className="italic">{log.reason}</span>
                    </p>
                  )}

                  <p className="mt-2 text-xs text-ink-500">
                    {log.user?.name || 'Unknown'} ({log.user?.email || '-'}) — {formatDate(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
