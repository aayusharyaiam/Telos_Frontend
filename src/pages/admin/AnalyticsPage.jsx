import { useEffect, useState } from 'react'
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsDistribution,
  getAchievementReport,
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
        const [ov, tr, dist] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrends(),
          getAnalyticsDistribution(),
        ])
        setOverview(ov)
        setTrends(tr)
        setDistribution(dist?.byThrustArea || [])
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
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
        <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
          <p className="text-sm font-semibold text-ink-900">Export Achievement Report</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              Quarter
              <select
                value={filterQuarter}
                onChange={(e) => setFilterQuarter(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              >
                {QUARTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              Department
              <input
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                placeholder="Filter by department"
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink-700">
              Employee
              <input
                value={filterEmployeeSearch}
                onChange={(e) => setFilterEmployeeSearch(e.target.value)}
                placeholder="Name or email"
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm"
              />
            </label>
            <button
              onClick={handleDownloadCSV}
              disabled={downloading === 'csv'}
              className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700 disabled:opacity-50"
            >
              {downloading === 'csv' ? 'Downloading...' : '📥 CSV'}
            </button>
            <button
              onClick={handleDownloadXLSX}
              disabled={downloading === 'xlsx'}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
            >
              {downloading === 'xlsx' ? 'Downloading...' : '📥 XLSX'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Quarter-on-Quarter Trend</p>
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
              <p className="mt-2 text-center text-xs text-ink-500">
                Average progress scores across {trends.reduce((s, t) => s + t.count, 0)} check-ins
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Goal Distribution by Thrust Area</p>
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
          </div>
        </div>
      </div>
    </AppShell>
  )
}
