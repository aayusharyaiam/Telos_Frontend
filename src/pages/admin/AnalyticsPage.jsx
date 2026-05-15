import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
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

const trendData = [
  { quarter: 'Q1', score: 62 },
  { quarter: 'Q2', score: 68 },
  { quarter: 'Q3', score: 72 },
  { quarter: 'Q4', score: 79 },
]

const distributionData = [
  { area: 'Revenue', goals: 24 },
  { area: 'Customer', goals: 18 },
  { area: 'Ops', goals: 16 },
  { area: 'People', goals: 12 },
]

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Track quarterly score trends and goal distribution by thrust area." 
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Quarter-on-Quarter Trend</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-ink-100">
            <p className="text-sm font-semibold text-ink-900">Goal Distribution</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="area" stroke="#6b7280" />
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
