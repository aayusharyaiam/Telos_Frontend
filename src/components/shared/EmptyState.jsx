import { motion } from 'framer-motion'

export default function EmptyState({ title, description, action, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-dashed border-ink-200 dark:border-outline/30 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-lg px-4 sm:px-6 py-10 sm:py-12 text-center"
    >
      {icon ? (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 flex justify-center text-ink-400 dark:text-outline"
        >
          {icon}
        </motion.div>
      ) : null}
      <h3 className="font-headline-md text-lg sm:text-xl text-ink-800 dark:text-inverse-on-surface">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm sm:text-base text-ink-600 dark:text-outline">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </motion.div>
  )
}
