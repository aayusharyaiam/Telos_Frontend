import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsDistribution,
  getAchievementReport,
  getManagerEffectiveness,
} from '../../api/reports.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const QUARTER_OPTIONS = [
  { value: '', label: 'All Quarters' },
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RETURNED', label: 'Returned' },
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

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState([])
  const [distribution, setDistribution] = useState([])
  const [managerEffectiveness, setManagerEffectiveness] = useState([])
  const [downloading, setDownloading] = useState('')
  const [error, setError] = useState('')

  // Filter state
  const [filterQuarter, setFilterQuarter] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterEmployeeSearch, setFilterEmployeeSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [ov, tr, dist, mgr] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrends(),
          getAnalyticsDistribution(),
          getManagerEffectiveness(),
        ])
        setOverview(ov)
        setTrends(tr)
        setDistribution(dist?.byThrustArea || [])
        setManagerEffectiveness(mgr || [])
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Could not load analytics')
      }
    }
    load()
  }, [])

  const buildFilters = () => {
    const filters = {}
    if (filterQuarter) filters.quarter = filterQuarter
    if (filterStatus) filters.status = filterStatus
    if (filterDepartment.trim()) filters.department = filterDepartment.trim()
    if (filterEmployeeSearch.trim()) filters.employeeSearch = filterEmployeeSearch.trim()
    return filters
  }

  const handleDownloadCSV = async () => {
    try {
      setDownloading('csv')
      const blob = await getAchievementReport('csv', buildFilters())
      triggerDownload(blob, 'achievement-report.csv')
    } catch (err) {
      setError('Failed to download CSV')
    } finally {
      setDownloading('')
    }
  }

  const handleDownloadXLSX = async () => {
    try {
      setDownloading('xlsx')
      const blob = await getAchievementReport('xlsx', buildFilters())
      triggerDownload(blob, 'achievement-report.xlsx')
    } catch (err) {
      setError('Failed to download XLSX')
    } finally {
      setDownloading('')
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Track quarterly score trends, goal distribution, and export reports."
        />

        {error && (
          <div className="rounded-xl bg-error-container/40 dark:bg-error-container/20 px-4 py-3 font-body-md text-body-md text-error">{error}</div>
        )}

        {overview && (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Users" value={overview.users} caption="Active employees" />
            <StatCard title="Goal Sheets" value={overview.sheets} caption="This cycle" />
            <StatCard
              title="Submitted"
              value={`${overview.submittedPercent}%`}
              caption={`${overview.submitted + overview.approved} of ${overview.sheets}`}
              tone="emerald"
            />
            <StatCard
              title="Approved"
              value={`${overview.approvedPercent}%`}
              caption={`${overview.approved} sheets`}
              tone="emerald"
            />
          </div>
        )}

        {/* Export Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Export Achievement Report</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              Quarter
              <select
                value={filterQuarter}
                onChange={(e) => setFilterQuarter(e.target.value)}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              >
                {QUARTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              Department
              <input
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                placeholder="Filter by department"
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              />
            </label>
            <label className="grid gap-1 font-body-md text-body-md font-semibold text-ink-700 dark:text-inverse-on-surface">
              Employee
              <input
                value={filterEmployeeSearch}
                onChange={(e) => setFilterEmployeeSearch(e.target.value)}
                placeholder="Name or email"
                className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2.5 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface shadow-sm"
              />
            </label>
            <button
              onClick={handleDownloadCSV}
              disabled={downloading === 'csv'}
              className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 disabled:opacity-50"
            >
              {downloading === 'csv' ? 'Downloading...' : '📥 CSV'}
            </button>
            <button
              onClick={handleDownloadXLSX}
              disabled={downloading === 'xlsx'}
              className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary hover:scale-[1.02] disabled:opacity-50"
            >
              {downloading === 'xlsx' ? 'Downloading...' : '📥 XLSX'}
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Quarter-on-Quarter Trend</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {trends.length > 0 && (
              <p className="mt-2 text-center font-body-sm text-body-sm text-ink-500 dark:text-outline">
                Average progress scores across {trends.reduce((s, t) => s + t.count, 0)} check-ins
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goal Distribution by Thrust Area</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="area" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="goals" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Manager Effectiveness */}
        {managerEffectiveness.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="mb-1 font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Manager Effectiveness</p>
            <p className="mb-4 font-body-sm text-body-sm text-ink-500 dark:text-outline">
              Check-in completion rates and average team scores across managers.
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={managerEffectiveness}
                  layout="vertical"
                  margin={{ left: 140, right: 40, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
                  <YAxis type="category" dataKey="managerName" stroke="#6b7280" tick={{ fontSize: 12 }} width={130} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="checkinCompletionRate" fill="#4f46e5" radius={[0, 8, 8, 0]} name="Check-in Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <motion.div
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {managerEffectiveness.map((m) => (
                <motion.div
                  key={m.managerId}
                  variants={itemVariants}
                  className="rounded-xl bg-sand-50 dark:bg-dark-bg px-4 py-3 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                >
                  <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{m.managerName}</p>
                  <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                    {m.directReports} reports · {m.checkinCompletionRate}% check-in rate · Avg team score: {m.avgTeamScore}%
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
