import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

const accentBorders = {
  indigo: 'border-l-4 border-primary-container',
  emerald: 'border-l-4 border-secondary',
  amber: 'border-l-4 border-tertiary-fixed-dim',
  danger: 'border-l-4 border-error',
}

export default function StatCard({ title, value, caption, tone = 'indigo', delay = 0 }) {
  const [count, setCount] = useState(typeof value === 'number' ? 0 : value)
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10)
  const isNumeric = typeof value === 'number' || (!isNaN(numericValue) && value !== null && value !== undefined)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isNumeric || hasAnimated.current) return
    hasAnimated.current = true
    const target = numericValue
    const duration = 800
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, isNumeric, numericValue])

  const displayValue = isNumeric ? count : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
      className={`bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg rounded-2xl p-5 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 flex flex-col justify-between hover:shadow-md transition-shadow ${accentBorders[tone] || accentBorders.indigo}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-label-bold text-label-bold text-ink-500 dark:text-outline uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="font-display text-stat-value text-ink-900 dark:text-inverse-on-surface">
        {displayValue}
      </div>
      {caption ? (
        <p className="mt-2 font-body-sm text-body-sm text-ink-500 dark:text-outline">{caption}</p>
      ) : null}
    </motion.div>
  )
}
