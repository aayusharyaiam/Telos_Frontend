import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { getTeamCheckinSummary, submitManagerCheckin } from '../../api/checkins.api'
import { SkeletonPage } from '../../components/shared/Skeleton'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/shared/Badge'
import { QUARTERS } from '../../utils/constants'

function currentCheckin(goal) {
  return goal.checkins?.[0] || null
}

export default function ManagerCheckinPage() {
  const { employeeId } = useParams()
  const [data, setData] = useState(null)
  const [quarter, setQuarter] = useState('Q2')
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')

  async function load() {
    setLoading(true)
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
      toast.error(err.response?.data?.error?.message || 'Could not load manager check-in')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [employeeId, quarter])

  const sheet = data?.sheets?.[0] || null
  const goals = sheet?.goals || []
  const canEdit = Boolean(data?.windowOpen)

  const updateComment = (checkinId, value) => {
    setComments((prev) => ({ ...prev, [checkinId]: value }))
  }

  const saveComment = async (checkinId) => {
    setSavingId(checkinId)
    try {
      await submitManagerCheckin(checkinId, comments[checkinId] || '')
      await load()
      toast.success('Comment submitted')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not submit manager comment')
    } finally {
      setSavingId('')
    }
  }

  if (loading) {
    return (
      <AppShell>
        <SkeletonPage rows={3} statCards={0} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title={`${quarter} Check-in`}
          subtitle={sheet ? `Reviewing ${sheet.user.name}'s ${quarter} achievements.` : 'No approved sheet found.'}
          chips={<Badge tone={canEdit ? 'emerald' : 'slate'}>{canEdit ? 'Window Open' : 'Read Only'}</Badge>}
          actions={
            <select
              className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 font-body-md text-body-md"
              value={quarter}
              onChange={(event) => setQuarter(event.target.value)}
            >
              {QUARTERS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          }
        />

        {!sheet ? (
          <p className="font-body-md text-body-md text-ink-600 dark:text-outline">No approved goal sheet is available for this employee yet.</p>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
            <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
              <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">Employee Goals</p>
            </div>
            <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
              {goals.map((goal, index) => {
                const checkin = currentCheckin(goal)
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr_auto] hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
                        {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
                      </div>
                      <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
                        Planned: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
                      </p>
                    </div>
                    <div className="font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                      Actual: {checkin?.actualAchievement ?? checkin?.actualDate?.slice(0, 10) ?? '--'}
                    </div>
                    <div>
                      <Badge tone={checkin?.checkinCompleted ? 'emerald' : 'amber'}>
                        {checkin?.checkinCompleted ? 'Complete' : checkin?.goalStatus || 'Pending'}
                      </Badge>
                    </div>
                    <label className="grid gap-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                      Manager Comment
                      <input
                        disabled={!checkin?.id || !canEdit}
                        value={checkin?.id ? comments[checkin.id] || '' : ''}
                        onChange={(event) => updateComment(checkin.id, event.target.value)}
                        className="rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-2 disabled:bg-sand-100"
                        placeholder={checkin?.id ? 'Add comment' : 'Employee has not saved this check-in'}
                      />
                    </label>
                    <div className="flex items-end gap-3">
                      <div className="font-headline-md text-headline-md text-ink-800">
                        {checkin?.progressScore === null || checkin?.progressScore === undefined
                          ? 'N/A'
                          : `${Number(checkin.progressScore).toFixed(1)}%`}
                      </div>
                      <button
                        disabled={!checkin?.id || !canEdit || savingId === checkin.id}
                        onClick={() => saveComment(checkin.id)}
                        className="rounded-xl bg-primary-container px-4 py-2 font-headline-md text-headline-md text-white hover:scale-[1.02] disabled:opacity-60"
                      >
                        Submit
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
