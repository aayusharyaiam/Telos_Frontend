import { motion } from 'framer-motion'

function getHeatColor(value, max = 100) {
  const ratio = Math.min(value / max, 1)
  if (ratio >= 0.8) return 'bg-emerald-500 text-white'
  if (ratio >= 0.6) return 'bg-emerald-400 text-emerald-950'
  if (ratio >= 0.4) return 'bg-amber-400 text-amber-950'
  if (ratio >= 0.2) return 'bg-orange-400 text-orange-950'
  return 'bg-sand-200 text-ink-600 dark:bg-dark-surface dark:text-inverse-on-surface'
}

function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

export default function HeatmapChart({ data, onCellClick }) {
  if (!data || !data.departments || data.departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-500 dark:text-outline">
        No heatmap data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="p-3 text-left font-label-bold text-label-bold text-ink-500 dark:text-outline uppercase tracking-wider">
              Department
            </th>
            {data.quarters.map((q) => (
              <th key={q} className="p-3 text-center font-label-bold text-label-bold text-ink-500 dark:text-outline uppercase tracking-wider">
                {q}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.departments.map((dept, rowIndex) => (
            <motion.tr
              key={dept}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="border-t border-sand-100 dark:border-outline/20 hover:bg-sand-50/50 dark:hover:bg-dark-surface/30 transition-colors"
            >
              <td className="p-3 font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                {dept}
              </td>
              {data.quarters.map((quarter) => {
                const cellData = data.data[dept]?.[quarter]
                const completionRate = cellData?.completionRate || 0
                const avgScore = cellData?.avgScore || 0

                return (
                  <td
                    key={quarter}
                    className="p-2 text-center cursor-pointer"
                    onClick={() => onCellClick?.(dept, quarter, cellData)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        inline-flex flex-col items-center justify-center w-16 h-14 rounded-lg
                        ${getHeatColor(completionRate)}
                        shadow-sm hover:shadow-md transition-all
                      `}
                    >
                      <span className="font-body-md text-body-md font-bold">
                        {completionRate}%
                      </span>
                      <span className={`text-xs font-semibold ${getScoreColor(avgScore)}`}>
                        {avgScore > 0 ? avgScore : '-'}
                      </span>
                    </motion.div>
                  </td>
                )
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-ink-500 dark:text-outline">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-sand-200 dark:bg-dark-surface"></span>
          0-20%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-400"></span>
          20-40%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-400"></span>
          40-60%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-400"></span>
          60-80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500"></span>
          80-100%
        </span>
      </div>
    </div>
  )
}