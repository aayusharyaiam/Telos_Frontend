import { useEffect, useState } from 'react'
import { getCycles, getActiveCycle, updateCycleWindow, archiveCycle } from '../../api/cycles.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import ConfirmModal from '../../components/shared/ConfirmModal'

const phaseLabels = {
  GOAL_SETTING: 'Goal Setting',
  Q1_CHECKIN: 'Q1 Check-in',
  Q2_CHECKIN: 'Q2 Check-in',
  Q3_CHECKIN: 'Q3 Check-in',
  Q4_CHECKIN: 'Q4 Check-in',
}

export default function CycleConfigPage() {
  const [cycles, setCycles] = useState([])
  const [activeCycle, setActiveCycle] = useState(null)
  const [error, setError] = useState('')
  const [pendingWindowChange, setPendingWindowChange] = useState(null)
  const [pendingArchive, setPendingArchive] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  async function loadData() {
    try {
      const [allCycles, active] = await Promise.all([
        getCycles(showArchived),
        getActiveCycle(),
      ])
      setCycles(allCycles)
      setActiveCycle(active)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load cycles')
    }
  }

  useEffect(() => {
    loadData()
  }, [showArchived])

  const setWindowStatus = async () => {
    if (!pendingWindowChange) return
    setSaving(true)
    try {
      await updateCycleWindow(pendingWindowChange.cycleId, pendingWindowChange.window.phase, pendingWindowChange.status)
      setPendingWindowChange(null)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not update cycle window')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!pendingArchive) return
    setSaving(true)
    try {
      await archiveCycle(pendingArchive.id)
      setPendingArchive(null)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not archive cycle')
    } finally {
      setSaving(false)
    }
  }

  const active = cycles.find(c => c.isActive) || activeCycle
  const inactiveCycles = cycles.filter(c => !c.isActive && !c.isArchived)
  const archivedCycles = cycles.filter(c => c.isArchived)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Cycle Configuration"
          subtitle="Force-open or close windows, archive past cycles."
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <ConfirmModal
          open={Boolean(pendingWindowChange)}
          title="Update Cycle Window"
          message={
            pendingWindowChange
              ? `Are you sure you want to ${pendingWindowChange.status === 'FORCE_OPEN' ? 'force open' : 'force close'} ${phaseLabels[pendingWindowChange.window.phase] || pendingWindowChange.window.phase}?`
              : ''
          }
          confirmLabel={pendingWindowChange?.status === 'FORCE_OPEN' ? 'Force Open' : 'Force Close'}
          tone={pendingWindowChange?.status === 'FORCE_OPEN' ? 'primary' : 'warning'}
          onConfirm={setWindowStatus}
          onCancel={() => setPendingWindowChange(null)}
          loading={saving}
        />

        <ConfirmModal
          open={Boolean(pendingArchive)}
          title="Archive Cycle"
          message={pendingArchive ? `Archive "${pendingArchive.name}"? It will be hidden from all views.` : ''}
          confirmLabel="Archive"
          tone="warning"
          onConfirm={handleArchive}
          onCancel={() => setPendingArchive(null)}
          loading={saving}
        />

        {/* Active Cycle Windows */}
        {active && (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">{active.name} Windows</p>
              <Badge tone="emerald">Active</Badge>
            </div>
            <div className="divide-y divide-ink-100">
              {(active.windows || []).map((window) => (
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
                    onClick={() => setPendingWindowChange({ cycleId: active.id, window, status: 'FORCE_OPEN' })}
                    className="text-left text-sm font-semibold text-primary-700"
                  >
                    Force Open
                  </button>
                  <button
                    onClick={() => setPendingWindowChange({ cycleId: active.id, window, status: 'FORCE_CLOSED' })}
                    className="text-left text-sm font-semibold text-ink-600"
                  >
                    Force Close
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Cycles */}
        {inactiveCycles.length > 0 && (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">Past Cycles ({inactiveCycles.length})</p>
            </div>
            <div className="divide-y divide-ink-100">
              {inactiveCycles.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4">
                  <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                  <button
                    onClick={() => setPendingArchive(c)}
                    className="text-sm font-semibold text-ink-500 hover:text-red-600"
                  >
                    Archive
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Cycles */}
        {archivedCycles.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-sm font-semibold text-ink-500"
            >
              {showArchived ? 'Hide' : 'Show'} archived cycles ({archivedCycles.length})
            </button>
            {showArchived && (
              <div className="mt-4 rounded-2xl bg-white/60 shadow-sm ring-1 ring-ink-100">
                <div className="border-b border-ink-100 px-6 py-4">
                  <p className="text-sm font-semibold text-ink-700">Archived Cycles</p>
                </div>
                <div className="divide-y divide-ink-100">
                  {archivedCycles.map((c) => (
                    <div key={c.id} className="px-6 py-4">
                      <p className="text-sm text-ink-600">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}