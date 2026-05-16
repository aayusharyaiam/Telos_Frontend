import { motion } from 'framer-motion'

const shimmer = 'bg-gradient-to-r from-sand-200 dark:from-dark-surface via-sand-100 dark:via-dark-bg to-sand-200 dark:to-dark-surface bg-[length:200%_100%] animate-pulse'

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-5 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
    >
      <div className={`h-3 w-24 rounded-full ${shimmer}`} />
      <div className={`mt-3 h-8 w-20 rounded-lg ${shimmer}`} />
      <div className={`mt-3 h-3 w-32 rounded-full ${shimmer}`} />
    </motion.div>
  )
}

export function SkeletonTableRow({ rows = 5 }) {
  return (
    <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-3/5 rounded-lg ${shimmer}`} />
            <div className={`h-3 w-2/5 rounded-lg ${shimmer}`} />
          </div>
          <div className={`h-4 w-20 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-16 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-24 rounded-lg ${shimmer}`} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 'h-64' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg p-6 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20"
    >
      <div className={`h-4 w-48 rounded-lg ${shimmer}`} />
      <div className={`mt-4 ${height} rounded-xl ${shimmer}`} />
    </motion.div>
  )
}

export function SkeletonInput() {
  return <div className={`h-10 w-full rounded-xl ${shimmer}`} />
}

export function SkeletonStatRow({ cards = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonPage({ rows = 5, statCards = 3, hasChart = false }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`h-7 w-48 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-64 rounded-lg ${shimmer}`} />
        </div>
        <div className={`h-10 w-32 rounded-xl ${shimmer}`} />
      </div>
      <SkeletonStatRow cards={statCards} />
      <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
        <div className="border-b border-sand-200/50 dark:border-outline/20 px-6 py-4">
          <div className={`h-5 w-32 rounded-lg ${shimmer}`} />
        </div>
        <SkeletonTableRow rows={rows} />
      </div>
      {hasChart && <SkeletonChart />}
    </div>
  )
}
