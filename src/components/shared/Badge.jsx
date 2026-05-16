import { motion } from 'framer-motion'

const toneStyles = {
  slate: 'bg-sand-200 dark:bg-ink-800 text-ink-800 dark:text-inverse-on-surface',
  indigo: 'bg-primary-container/10 dark:bg-primary-container/20 text-primary dark:text-primary-fixed-dim',
  emerald: 'bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-fixed',
  amber: 'bg-tertiary-fixed-dim/20 dark:bg-tertiary-fixed-dim/30 text-tertiary-container dark:text-tertiary-fixed-dim',
  red: 'bg-error-container/40 dark:bg-error-container/20 text-error dark:text-error',
}

export default function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-label-bold text-[10px] uppercase tracking-wider ${toneStyles[tone] || toneStyles.slate} ${className}`}
    >
      {tone === 'amber' ? (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
          {children}
        </span>
      ) : (
        children
      )}
    </motion.span>
  )
}
