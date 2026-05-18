import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAdminSummary } from '../../api/reports.api'
import { syncUser } from '../../api/auth.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const cardSlide = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const cardSlideRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  async function loadStats() {
    try {
      setStats(await getAdminSummary())
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not load dashboard data')
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  function exportCSV() {
    if (!stats) {
      toast.error('No data available to export')
      return
    }

    const s = stats
    const rows = [
      ['Metric', 'Value'],
      ['Active Cycle', s.activeCycleName || '-'],
      ['Active Users', s.totalActiveUsers ?? 0],
      ['Total Goal Sheets', s.totalGoalSheets ?? 0],
      ['Submitted Sheets', s.submittedCount ?? 0],
      ['Approved Sheets', s.approvedCount ?? 0],
      ['Completion Rate', s.selectedCompletionRate != null ? `${s.selectedCompletionRate}%` : '-'],
      ['Completed Count', s.selectedCompletedCount ?? 0],
      ['Dashboard Quarter', s.dashboardQuarter || '-'],
    ]

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  async function handleSync() {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await syncUser()
      await loadStats()
      toast.success(`Systems synced and updated at ${new Date().toLocaleTimeString()}`)
    } catch (err) {
      toast.error('Failed to sync systems. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const s = stats || {}

  return (
    <AppShell>
      <PageHeader
        title="Admin Command Center"
        subtitle="System overview and priority operations."
        actions={
          <div className="flex gap-3">
            <button 
              onClick={exportCSV}
              className="inline-flex items-center rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-4 py-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface transition hover:scale-[1.02]"
            >
              Export Report
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center rounded-xl bg-primary-container px-4 py-2 font-label-bold text-label-bold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Syncing...
                </span>
              ) : 'Sync Systems'}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Active Cycle"
          value={s.activeCycleName || '—'}
          caption="Current cycle"
        />
        <StatCard
          title="Active Users"
          value={s.totalActiveUsers ?? '—'}
          caption="Total enrolled"
          tone="emerald"
        />
        <StatCard
          title="Goal Sheets"
          value={s.totalGoalSheets ?? '—'}
          caption="Total sheets"
          tone="indigo"
        />
        <StatCard
          title="Submitted"
          value={s.submittedCount ?? '—'}
          caption="Awaiting approval"
          tone="amber"
        />
        <StatCard
          title="Approved"
          value={s.approvedCount ?? '—'}
          caption="Completed"
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title={`${s.dashboardQuarter || 'Check-in'} Completion`}
          value={s.selectedCompletionRate != null ? `${s.selectedCompletionRate}%` : '—'}
          caption={`${s.selectedCompletedCount ?? 0} of ${s.totalGoalSheets ?? 0} sheets completed`}
          tone="emerald"
        />
        <StatCard
          title="Pending Approval"
          value={String((s.submittedCount ?? 0) - (s.approvedCount ?? 0))}
          caption="Sheets awaiting review"
          tone="amber"
        />
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={stagger}
        className="grid gap-4 md:grid-cols-2"
      >
        <motion.div
          variants={cardSlide}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-md p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Priority Actions</h3>
            <button onClick={() => toast('Priority actions list coming soon!')} className="font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50 dark:bg-dark-bg hover:bg-sand-100 dark:hover:bg-ink-800 transition-colors border border-sand-200/50 dark:border-outline/10 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <div>
                  <p className="font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface font-medium">Goal Alignment Escalation</p>
                  <p className="font-caption text-caption text-ink-500 dark:text-outline">Engineering Dept • 2h ago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardSlideRight}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-md p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 flex flex-col h-[320px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">System Health</h3>
            <span className="inline-flex items-center gap-1 font-label-bold text-label-bold text-secondary dark:text-secondary-fixed bg-secondary/10 dark:bg-secondary/20 px-2 py-1 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              All Systems Operational
            </span>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-bold text-label-bold text-ink-600 dark:text-outline uppercase">Database Sync</span>
                <span className="font-caption text-caption text-secondary dark:text-secondary-fixed font-bold">100%</span>
              </div>
              <div className="w-full h-2 bg-sand-200 dark:bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-bold text-label-bold text-ink-600 dark:text-outline uppercase">API Latency</span>
                <span className="font-caption text-caption text-secondary dark:text-secondary-fixed font-bold">24ms</span>
              </div>
              <div className="w-full h-2 bg-sand-200 dark:bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-label-bold text-label-bold text-ink-600 dark:text-outline uppercase">Storage Capacity</span>
                <span className="font-caption text-caption text-tertiary-fixed-dim font-bold">82%</span>
              </div>
              <div className="w-full h-2 bg-sand-200 dark:bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  )
}
