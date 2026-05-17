import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsDistribution,
  getAchievementReport,
  getManagerEffectiveness,
  getAnalyticsHeatmap,
  getDepartmentPerformance,
  getGoalTimeline,
} from '../../api/reports.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/shared/StatCard'
import HeatmapChart from '../../components/analytics/HeatmapChart'
import GoalTimelineChart from '../../components/analytics/GoalTimelineChart'
import TreemapChart from '../../components/analytics/TreemapChart'
import DrilldownModal from '../../components/analytics/DrilldownModal'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
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
  const [uomDistribution, setUomDistribution] = useState([])
  const [managerEffectiveness, setManagerEffectiveness] = useState([])
  const [heatmap, setHeatmap] = useState(null)
  const [departmentPerformance, setDepartmentPerformance] = useState([])
  const [goalTimeline, setGoalTimeline] = useState([])
  const [downloading, setDownloading] = useState('')

  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const [drilldownData, setDrilldownData] = useState(null)
  const [drilldownType, setDrilldownType] = useState('')
  const [drilldownTitle, setDrilldownTitle] = useState('')

  const [filterQuarter, setFilterQuarter] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterEmployeeSearch, setFilterEmployeeSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [ov, tr, dist, mgr, hm, dept, timeline] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrends(),
          getAnalyticsDistribution(),
          getManagerEffectiveness(),
          getAnalyticsHeatmap(),
          getDepartmentPerformance(),
          getGoalTimeline(),
        ])
        setOverview(ov)
        setTrends(tr)
        setDistribution(dist?.byThrustArea || [])
        setUomDistribution(dist?.byUom || [])
        setManagerEffectiveness(mgr || [])
        setHeatmap(hm)
        setDepartmentPerformance(dept || [])
        setGoalTimeline(timeline || [])
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Could not load analytics')
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
    } catch {
      toast.error('Failed to download CSV')
    } finally {
      setDownloading('')
    }
  }

  const handleDownloadXLSX = async () => {
    try {
      setDownloading('xlsx')
      const blob = await getAchievementReport('xlsx', buildFilters())
      triggerDownload(blob, 'achievement-report.xlsx')
    } catch {
      toast.error('Failed to download XLSX')
    } finally {
      setDownloading('')
    }
  }

  const handleHeatmapClick = (dept, quarter) => {
    const deptData = departmentPerformance.find(d => d.department === dept)
    if (deptData) {
      setDrilldownData(deptData)
      setDrilldownType('department')
      setDrilldownTitle(`${dept} - ${quarter} Performance`)
      setDrilldownOpen(true)
    }
  }

  const handleTreemapClick = (item) => {
    setDrilldownData(item)
    setDrilldownType('treemap')
    setDrilldownTitle(`${item.area || item.uom} - Goal Details`)
    setDrilldownOpen(true)
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Track quarterly score trends, goal distribution, and export reports."
        />

        {overview && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Export Achievement Report</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Quarter Trend (Score & Volume)</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="score" stroke="#4f46e5" fill="#4f46e520" strokeWidth={2} name="Avg Score" />
                  <Area yAxisId="right" type="monotone" dataKey="count" stroke="#10b981" fill="#10b98120" strokeWidth={2} name="Check-ins" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {trends.length > 0 && (
              <p className="mt-2 text-center font-body-sm text-body-sm text-ink-500 dark:text-outline">
                Across {trends.reduce((s, t) => s + t.count, 0)} check-ins
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goal Distribution (Treemap)</p>
            <TreemapChart data={distribution} onItemClick={handleTreemapClick} />
          </motion.div>
        </div>

        {heatmap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Department × Quarter Heatmap</p>
            <p className="mb-4 font-body-sm text-body-sm text-ink-500 dark:text-outline">
              Click any cell to drill down. Shows completion % (color) + avg score (number)
            </p>
            <HeatmapChart data={heatmap} onCellClick={handleHeatmapClick} />
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goal Timeline (On-time vs Late)</p>
            <GoalTimelineChart data={goalTimeline} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Goal Types Distribution</p>
            <div className="h-64 flex items-center justify-center">
              {uomDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={uomDistribution}
                      dataKey="goals"
                      nameKey="uom"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ uom, goals }) => `${uom}: ${goals}`}
                    >
                      {uomDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-ink-500 dark:text-outline">No UoM data</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {departmentPerformance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
            >
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Department Performance</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentPerformance.slice(0, 6)} layout="vertical" margin={{ left: 100, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                    <YAxis type="category" dataKey="department" stroke="#6b7280" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="completionRate" fill="#4f46e5" radius={[0, 8, 8, 0]} name="Completion" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {managerEffectiveness.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
            >
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Manager Effectiveness</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={managerEffectiveness}
                    layout="vertical"
                    margin={{ left: 100, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
                    <YAxis type="category" dataKey="managerName" stroke="#6b7280" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="checkinCompletionRate" fill="#10b981" radius={[0, 8, 8, 0]} name="Check-in Rate" />
                    <Bar dataKey="avgTeamScore" fill="#4f46e5" radius={[0, 8, 8, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {managerEffectiveness.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
          >
            <p className="mb-1 font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Manager Performance Cards</p>
            <p className="mb-4 font-body-sm text-body-sm text-ink-500 dark:text-outline">
              Click any manager card to see detailed team performance
            </p>
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {managerEffectiveness.map((m) => (
                <motion.div
                  key={m.managerId}
                  variants={itemVariants}
                  whileHover={{ y: -2, boxShadow: '0 8px 12px -2px rgba(0,0,0,0.1)' }}
                  className="rounded-xl bg-sand-50 dark:bg-dark-bg px-4 py-3 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-all cursor-pointer"
                  onClick={() => {
                    setDrilldownData(m)
                    setDrilldownType('manager')
                    setDrilldownTitle(`${m.managerName}'s Team Performance`)
                    setDrilldownOpen(true)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">{m.managerName}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      m.checkinCompletionRate >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      m.checkinCompletionRate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {m.checkinCompletionRate}%
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline mt-1">
                    {m.directReports} reports · {m.avgTeamScore}% avg score
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        <DrilldownModal
          isOpen={drilldownOpen}
          onClose={() => setDrilldownOpen(false)}
          data={drilldownData}
          type={drilldownType}
          title={drilldownTitle}
        />
      </div>
    </AppShell>
  )
}