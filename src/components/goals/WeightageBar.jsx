import { motion } from 'framer-motion'
import Badge from '../shared/Badge'

export default function WeightageBar({ totalWeightage }) {
  const isExact = totalWeightage === 100
  const isOver = totalWeightage > 100
  const fillWidth = Math.min(Math.max(totalWeightage, 0), 100)

  const barColor = isExact
    ? 'bg-secondary'
    : isOver
    ? 'bg-error'
    : totalWeightage >= 70
    ? 'bg-primary-container'
    : 'bg-tertiary-fixed-dim'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-md p-5 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-label-bold text-label-bold text-ink-900 dark:text-inverse-on-surface">Weightage Health</p>
          <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline mt-0.5">
            Total must equal 100% to submit.
          </p>
        </div>
        <Badge tone={isExact ? 'emerald' : 'amber'}>
          {totalWeightage}% allocated
        </Badge>
      </div>
      <div className="h-3 w-full bg-sand-200 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${fillWidth}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
      <div className="mt-2 text-right">
        <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
          {100 - totalWeightage}% remaining to allocate
        </span>
      </div>
    </motion.div>
  )
}
