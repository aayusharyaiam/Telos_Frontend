import { useEffect, useState } from 'react'
import { getActiveCycle, updateCycleWindow } from '../../api/cycles.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const phaseLabels = {
  GOAL_SETTING: 'Goal Setting',
  Q1_CHECKIN: 'Q1 Check-in',
  Q2_CHECKIN: 'Q2 Check-in',
  Q3_CHECKIN: 'Q3 Check-in',
  Q4_CHECKIN: 'Q4 Check-in',
}

export default function CycleConfigPage() {
  const [cycle, setCycle] = useState(null)
  const [error, setError] = useState('')

  async function loadCycle() {
    try {
      setCycle(await getActiveCycle())
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load active cycle')
    }
  }

  useEffect(() => {
    loadCycle()
  }, [])

  const setWindowStatus = async (window, status) => {
    await updateCycleWindow(cycle.id, window.phase, status)
    await loadCycle()
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Cycle Configuration"
          subtitle="Force-open or close windows to manage demo and exception flows."
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
          <div className="border-b border-ink-100 px-6 py-4">
            <p className="text-sm font-semibold text-ink-900">{cycle?.name || 'Active Cycle'} Windows</p>
          </div>
          <div className="divide-y divide-ink-100">
            {(cycle?.windows || []).map((window) => (
              <div key={window.phase} className="grid gap-4 px-6 py-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{phaseLabels[window.phase] || window.phase}</p>
                  <p className="text-xs text-ink-500">
                    {window.opensAt.slice(0, 10)} - {window.closesAt.slice(0, 10)}
                  </p>
                </div>
                <div>
                  <Badge tone={window.status === 'OPEN' || window.status === 'FORCE_OPEN' ? 'emerald' : 'slate'}>
                    {window.status}
                  </Badge>
                </div>
                <button
                  onClick={() => setWindowStatus(window, 'FORCE_OPEN')}
                  className="text-left text-sm font-semibold text-primary-700"
                >
                  Force Open
                </button>
                <button
                  onClick={() => setWindowStatus(window, 'FORCE_CLOSED')}
                  className="text-left text-sm font-semibold text-ink-600"
                >
                  Force Close
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
