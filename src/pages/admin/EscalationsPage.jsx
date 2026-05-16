import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getEscalationRules, createEscalationRule, updateEscalationRule,
  getEscalations, resolveEscalation, runEscalationCheck,
} from '../../api/admin.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
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

export default function EscalationsPage() {
  const [rules, setRules] = useState([])
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading] = useState(true)
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
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load data')
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
      toast.success('Escalation rule created')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create rule')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleRule = async (rule) => {
    try {
      await updateEscalationRule(rule.id, { isActive: !rule.isActive })
      await load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update rule')
    }
  }

  const handleResolve = async (esc) => {
    try {
      await resolveEscalation(esc.id)
      await load()
      toast.success('Escalation resolved')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to resolve')
    }
  }

  const handleRunCheck = async () => {
    try {
      setRunning(true)
      await runEscalationCheck()
      await load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to run escalation check')
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
              className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] disabled:opacity-60"
            >
              {running ? 'Running...' : 'Run Escalation Check'}
            </button>
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-sand-100 dark:bg-dark-bg p-1">
          {['rules', 'log'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === t
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-dark-surface dark:text-primary-fixed-dim'
                  : 'text-ink-600 dark:text-outline hover:text-ink-900 dark:hover:text-inverse-on-surface'
              }`}
            >
              {t === 'rules' ? `Rules (${rules.length})` : `Escalation Log (${escalations.length})`}
            </button>
          ))}
        </div>

        {loading && (
          <SkeletonPage rows={3} statCards={0} />
        )}

        {/* Rules Tab */}
        {!loading && tab === 'rules' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleCreateRule} className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_auto]">
                <input
                  type="text"
                  placeholder="Rule name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                />
                <select
                  value={newRule.phase}
                  onChange={(e) => setNewRule({ ...newRule, phase: e.target.value })}
                  className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
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
                    className="w-20 rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
                  />
                  <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">days</span>
                </div>
                <button
                  type="submit"
                  disabled={creating || !newRule.name.trim()}
                  className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02] disabled:opacity-50"
                >
                  Add Rule
                </button>
              </form>
            </motion.div>

            {!rules.length ? (
              <EmptyState title="No escalation rules" description="Create rules above to automate overdue detection." />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
              >
                <motion.div
                  className="divide-y divide-sand-200/30 dark:divide-outline/10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {rules.map((rule) => (
                    <motion.div
                      key={rule.id}
                      variants={itemVariants}
                      className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                    >
                      <div>
                        <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{rule.name}</p>
                        <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
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
                          className="font-body-md text-body-md font-semibold text-primary dark:text-primary-fixed-dim transition hover:text-primary-900"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        )}

        {/* Escalation Log Tab */}
        {!loading && tab === 'log' && (
          <>
            {!escalations.length ? (
              <EmptyState title="No escalations" description="Escalation records will appear when rules are triggered." />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
              >
                <motion.div
                  className="divide-y divide-sand-200/30 dark:divide-outline/10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {escalations.map((esc) => (
                    <motion.div
                      key={esc.id}
                      variants={itemVariants}
                      className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                            {esc.user?.name || 'Unknown'}
                          </p>
                          <Badge tone={STATUS_TONES[esc.status] || 'slate'}>
                            {esc.status}
                          </Badge>
                        </div>
                        <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                          Rule: {esc.rule?.name || '-'} · Phase: {esc.rule?.phase?.replace(/_/g, ' ') || '-'}
                        </p>
                        <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                          Created: {formatDate(esc.createdAt)}
                          {esc.resolvedAt && ` · Resolved: ${formatDate(esc.resolvedAt)}`}
                        </p>
                      </div>
                      {esc.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(esc)}
                          className="rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary/90"
                        >
                          Resolve
                        </button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
