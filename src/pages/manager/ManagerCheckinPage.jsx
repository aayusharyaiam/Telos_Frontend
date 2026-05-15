import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTeamCheckinSummary, submitManagerCheckin } from '../../api/checkins.api'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'

const quarter = 'Q2'

function currentCheckin(goal) {
  return goal.checkins?.[0] || null
}

export default function ManagerCheckinPage() {
  const { employeeId } = useParams()
  const [data, setData] = useState(null)
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const next = await getTeamCheckinSummary({ employeeId, quarter })
      setData(next)
      const nextComments = {}
      for (const sheet of next.sheets) {
        for (const goal of sheet.goals) {
          const checkin = currentCheckin(goal)
          if (checkin) nextComments[checkin.id] = checkin.managerComment || ''
        }
      }
      setComments(nextComments)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load manager check-in')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [employeeId])

  const sheet = data?.sheets?.[0] || null
  const goals = sheet?.goals || []

  const updateComment = (checkinId, value) => {
    setComments((prev) => ({ ...prev, [checkinId]: value }))
  }

  const saveComment = async (checkinId) => {
    setSavingId(checkinId)
    setError('')
    try {
      await submitManagerCheckin(checkinId, comments[checkinId] || '')
      await load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not submit manager comment')
    } finally {
      setSavingId('')
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-ink-600">Loading manager check-in...</p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Manager Check-in"
          subtitle={sheet ? `Reviewing ${sheet.user.name}'s ${quarter} achievements.` : 'No approved sheet found.'}
          chips={<Badge tone="emerald">{quarter} Window Open</Badge>}
        />

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        {!sheet ? (
          <p className="text-sm text-ink-600">No approved goal sheet is available for this employee yet.</p>
        ) : (
          <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-ink-100">
            <div className="border-b border-ink-100 px-6 py-4">
              <p className="text-sm font-semibold text-ink-900">Employee Goals</p>
            </div>
            <div className="divide-y divide-ink-100">
              {goals.map((goal) => {
                const checkin = currentCheckin(goal)
                return (
                  <div key={goal.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_auto]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">{goal.title}</p>
                        {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
                      </div>
                      <p className="text-xs text-ink-500">
                        Planned: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                      </p>
                    </div>
                    <div className="text-sm text-ink-700">
                      Actual: {checkin?.actualAchievement ?? checkin?.actualDate?.slice(0, 10) ?? '--'}
                    </div>
                    <div>
                      <Badge tone={checkin?.checkinCompleted ? 'emerald' : 'amber'}>
                        {checkin?.checkinCompleted ? 'Complete' : checkin?.goalStatus || 'Pending'}
                      </Badge>
                    </div>
                    <label className="grid gap-2 text-sm text-ink-700">
                      Manager Comment
                      <input
                        disabled={!checkin?.id}
                        value={checkin?.id ? comments[checkin.id] || '' : ''}
                        onChange={(event) => updateComment(checkin.id, event.target.value)}
                        className="rounded-lg border border-ink-200 bg-white px-3 py-2 disabled:bg-sand-100"
                        placeholder={checkin?.id ? 'Add comment' : 'Employee has not saved this check-in'}
                      />
                    </label>
                    <div className="flex items-end gap-3">
                      <div className="text-sm font-semibold text-ink-800">
                        {checkin?.progressScore === null || checkin?.progressScore === undefined
                          ? 'N/A'
                          : `${Number(checkin.progressScore).toFixed(1)}%`}
                      </div>
                      <button
                        disabled={!checkin?.id || savingId === checkin.id}
                        onClick={() => saveComment(checkin.id)}
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
