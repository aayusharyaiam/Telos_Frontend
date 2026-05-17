import { motion } from 'framer-motion'

const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#6366f1', '#14b8a6'
]

function getColor(index) {
  return COLORS[index % COLORS.length]
}

export default function TreemapChart({ data, onItemClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-500 dark:text-outline">
        No distribution data available
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.goals, 0)
  let currentX = 0

  return (
    <div className="relative w-full h-64">
      <div className="absolute inset-0 flex flex-wrap content-start gap-1 p-1">
        {data.map((item, index) => {
          const width = Math.max((item.goals / total) * 100, 8)
          const height = Math.min(Math.max(width * 0.6, 40), 100)
          const color = getColor(index)

          return (
            <motion.div
              key={item.area || item.department || item.uom}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              onClick={() => onItemClick?.(item)}
              className="rounded-lg cursor-pointer flex flex-col justify-center items-center p-2 text-center overflow-hidden"
              style={{
                width: `${width}%`,
                height: `${height}px`,
                backgroundColor: `${color}20`,
                borderLeft: `4px solid ${color}`,
              }}
            >
              <span className="font-body-sm text-body-sm font-semibold text-ink-900 dark:text-inverse-on-surface truncate w-full">
                {item.area || item.department || item.uom}
              </span>
              <span className="font-body-xs text-body-xs text-ink-500 dark:text-outline">
                {item.goals} goals
              </span>
              <span className="font-body-xs text-body-xs" style={{ color }}>
                {total > 0 ? Math.round((item.goals / total) * 100) : 0}%
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}