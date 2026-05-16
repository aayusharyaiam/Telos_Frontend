import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { computeScore } from '../../utils/scoreComputer'

export default function ProgressScoreBadge({ uomType, target, actual, targetDate, actualDate }) {
  const result = computeScore({ uomType, target, actual, targetDate, actualDate })
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  const score = result !== null && result !== undefined ? Number(result) : null

  useEffect(() => {
    if (score === null || hasAnimated.current) return
    hasAnimated.current = true
    const duration = 600
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * score))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  if (score === null) {
    return <span className="font-body-md text-body-md font-semibold text-ink-500 dark:text-outline">N/A</span>
  }

  const color =
    score >= 80
      ? 'text-secondary dark:text-secondary-fixed'
      : score >= 50
      ? 'text-tertiary-fixed-dim'
      : 'text-error'

  const bgColor =
    score >= 80
      ? 'bg-secondary/10 dark:bg-secondary/20'
      : score >= 50
      ? 'bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30'
      : 'bg-error-container/40 dark:bg-error-container/20'

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-label-bold text-label-bold ${color} ${bgColor}`}
    >
      {count}%
    </motion.span>
  )
}
