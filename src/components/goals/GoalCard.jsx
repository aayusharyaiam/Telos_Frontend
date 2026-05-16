import { motion } from 'framer-motion'
import Badge from '../shared/Badge'

const leftAccents = {
  shared: 'bg-secondary',
  normal: 'bg-primary-container',
  locked: 'bg-outline',
}

export default function GoalCard({ goal, canEdit, onUpdateWeightage, onDelete, index = 0 }) {
  const accentKey = goal.isShared ? 'shared' : goal.isLocked ? 'locked' : 'normal'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-xl bg-white/60 dark:bg-dark-surface/60 backdrop-blur-md ring-1 ring-ink-100/10 dark:ring-outline/20 p-5 shadow-sm hover:shadow-md hover:ring-primary/30 dark:hover:ring-primary-fixed/30 transition-all duration-300 group"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${leftAccents[accentKey] || leftAccents.normal}`} />
      <div className="ml-2 grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">{goal.title}</p>
            {goal.isShared ? <Badge tone="indigo">Shared</Badge> : null}
          </div>
          <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline mt-1">{goal.thrustArea}</p>
        </div>
        <div className="flex items-center font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
          Target: {goal.target ?? goal.targetDate?.slice(0, 10) ?? '--'}
        </div>
        <label className="flex items-center gap-2 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
          Weightage
          <input
            type="number"
            min="10"
            max="100"
            value={goal.weightage}
            disabled={!canEdit}
            onChange={(event) => onUpdateWeightage(goal, Number(event.target.value))}
            className="w-20 rounded-lg border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-bg/50 px-2 py-1 font-body-md text-body-md text-ink-900 dark:text-inverse-on-surface disabled:bg-sand-100 dark:disabled:bg-dark-bg disabled:opacity-60 focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
          />
          %
        </label>
        <div className="flex items-center gap-2">
          {canEdit && !goal.isShared ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="font-label-bold text-label-bold text-error hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-error-container/20"
              onClick={() => onDelete(goal.id)}
            >
              Delete
            </motion.button>
          ) : canEdit && goal.isShared ? (
            <Badge tone="indigo">Target Locked</Badge>
          ) : (
            <Badge tone={goal.isLocked ? 'emerald' : 'slate'}>
              {goal.isLocked ? 'Locked' : '--'}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}
