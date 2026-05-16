import { motion } from 'framer-motion'

const rowVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 },
  }),
}

export default function Table({ columns, rows, emptyMessage = 'No data available.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 px-6 py-12 text-center font-body-md text-body-md text-ink-500 dark:text-outline shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 dark:bg-dark-surface/70 shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand-200/50 dark:border-outline/20 bg-white/20 dark:bg-dark-bg/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left font-label-bold text-label-bold text-ink-500 dark:text-outline uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200/30 dark:divide-outline/10">
            {rows.map((row, i) => (
              <motion.tr
                key={row.id || i}
                custom={i}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                className="transition-colors hover:bg-white/50 dark:hover:bg-dark-bg/30 group"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
