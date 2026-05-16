import { useEffect, useState } from 'react'
import {
  getEscalationRules, createEscalationRule, updateEscalationRule,
  getEscalations, resolveEscalation, runEscalationCheck,
} from '../../api/admin.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'

const PHASE_OPTIONS = [
  { value: 'GOAL_SETTING', label: 'Goal Setting' },
  { value: 'Q1_CHECKIN', label: 'Q1 Check-in' },
  { value: 'Q2_CHECKIN', label: 'Q2 Check-in' },
  { value: 'Q3_CHECKIN', label: 'Q3 Check-in' },
  { value: 'Q4_CHECKIN', label: 'Q4 Check-in' },
]

const STATUS_TONES = {
  PENDING: 'amber',
  ESCALATED: 'red',
  RESOLVED: 'emerald',
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EscalationsPage() {
  const [rules, setRules] = useState([])
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('rules')
  const [running, setRunning] = useState(false)

  // New rule form
  const [newRule, setNewRule] = useState({ name: '', phase: 'GOAL_SETTING', triggerAfterDays: 7 })
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const [r, e] = await Promise.all([getEscalationRules(), getEscalations()])
      setRules(r)
      setEscalations(e)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreateRule = async (e) => {
    e.preventDefault()
    if (!newRule.name.trim()) return
    try {
      setCreating(true)
      await createEscalationRule(newRule)
      setNewRule({ name: '', phase: 'GOAL_SETTING', triggerAfterDays: 7 })
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create rule')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleRule = async (rule) => {
    try {
      await updateEscalationRule(rule.id, { isActive: !rule.isActive })
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update rule')
    }
  }

  const handleResolve = async (esc) => {
    try {
      await resolveEscalation(esc.id)
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to resolve')
    }
  }

  const handleRunCheck = async () => {
    try {
      setRunning(true)
      await runEscalationCheck()
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to run escalation check')
    } finally {
      setRunning(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Escalation Management"
          subtitle="Configure rules and manage escalation alerts."
          actions={
            <button
              onClick={handleRunCheck}
              disabled={running}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {running ? 'Running...' : 'Run Escalation Check'}
            </button>
          }
        />

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-sand-100 p-1">
          {['rules', 'log'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {t === 'rules' ? `Rules (${rules.length})` : `Escalation Log (${escalations.length})`}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-ink-500">Loading...</div>
        )}

        {/* Rules Tab */}
        {!loading && tab === 'rules' && (
          <>
            <form onSubmit={handleCreateRule} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
              <input
                type="text"
                placeholder="Rule name"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
              <select
                value={newRule.phase}
                onChange={(e) => setNewRule({ ...newRule, phase: e.target.value })}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              >
                {PHASE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={newRule.triggerAfterDays}
                  onChange={(e) => setNewRule({ ...newRule, triggerAfterDays: Number(e.target.value) })}
                  className="w-20 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
                />
                <span className="text-xs text-ink-500">days</span>
              </div>
              <button
                type="submit"
                disabled={creating || !newRule.name.trim()}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
              >
                Add Rule
              </button>
            </form>

            {!rules.length ? (
              <EmptyState title="No escalation rules" description="Create rules above to automate overdue detection." />
            ) : (
              <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
                <div className="divide-y divide-ink-100">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{rule.name}</p>
                        <p className="text-xs text-ink-500">
                          Phase: {rule.phase.replace(/_/g, ' ')} · Trigger after {rule.triggerAfterDays} days
                          {rule._count?.escalations ? ` · ${rule._count.escalations} triggered` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={rule.isActive ? 'emerald' : 'red'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className="text-sm font-semibold text-primary-700 transition hover:text-primary-900"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Escalation Log Tab */}
        {!loading && tab === 'log' && (
          <>
            {!escalations.length ? (
              <EmptyState title="No escalations" description="Escalation records will appear when rules are triggered." />
            ) : (
              <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
                <div className="divide-y divide-ink-100">
                  {escalations.map((esc) => (
                    <div key={esc.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">
                            {esc.user?.name || 'Unknown'}
                          </p>
                          <Badge tone={STATUS_TONES[esc.status] || 'slate'}>
                            {esc.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink-500">
                          Rule: {esc.rule?.name || '-'} · Phase: {esc.rule?.phase?.replace(/_/g, ' ') || '-'}
                        </p>
                        <p className="text-xs text-ink-500">
                          Created: {formatDate(esc.createdAt)}
                          {esc.resolvedAt && ` · Resolved: ${formatDate(esc.resolvedAt)}`}
                        </p>
                      </div>
                      {esc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(esc)}
                          className="rounded-xl bg-accent-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-700"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
