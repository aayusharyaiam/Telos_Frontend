import { motion } from 'framer-motion'

export default function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 px-8 py-6"
      >
        <img src="/logo-mark.svg" alt="Telos" className="h-12 w-12 object-contain" />
        <div className="flex items-center gap-3 rounded-full bg-white/80 dark:bg-dark-surface/80 px-6 py-3 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
          <span className="font-body-md text-body-md font-semibold text-ink-800 dark:text-inverse-on-surface">
            Loading Telos...
          </span>
        </div>
      </motion.div>
    </div>
  )
}
