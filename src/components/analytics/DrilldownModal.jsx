import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function DrilldownModal({ isOpen, onClose, data, type, title }) {
  if (!data) return null

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  const getStatusIcon = (completed) => {
    return completed
      ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      : <ClockIcon className="w-5 h-5 text-amber-500" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-ink-100/20 dark:ring-outline/30 z-50"
          >
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-sand-100 dark:border-outline/20 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                  {title}
                </h2>
                {type === 'employee' && data.employee && (
                  <p className="mt-1 font-body-sm text-body-sm text-ink-500 dark:text-outline">
                    {data.employee.department} • Manager: {data.employee.manager}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-sand-100 dark:hover:bg-dark-bg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-ink-500 dark:text-outline" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {type === 'employee' && data.goalSheets?.map((sheet, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl bg-sand-50/50 dark:bg-dark-bg/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body-lg text-body-lg font-semibold text-ink-900 dark:text-inverse-on-surface">
                      {sheet.cycle || 'Unknown Cycle'}
                    </h3>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${sheet.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      ${sheet.status === 'SUBMITTED' ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}
                      ${sheet.status === 'RETURNED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                      ${sheet.status === 'DRAFT' ? 'bg-sand-200 text-ink-600 dark:bg-dark-surface dark:text-inverse-on-surface' : ''}
                    `}>
                      {sheet.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sheet.goals?.map((goal, gIdx) => (
                      <div key={gIdx} className="rounded-lg bg-white dark:bg-dark-surface p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                              {goal.title}
                            </p>
                            <p className="text-xs text-ink-500 dark:text-outline mt-1">
                              {goal.thrustArea} • {goal.weightage}% weight
                            </p>
                          </div>
                          <span className="text-xs font-medium text-ink-400 dark:text-outline">
                            {goal.uomType}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {goal.checkins?.map((checkin) => (
                            <div
                              key={checkin.quarter}
                              className={`rounded-lg p-2 text-center ${checkin.checkinCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-sand-100 dark:bg-dark-bg'}`}
                            >
                              <div className="flex items-center justify-center gap-1 mb-1">
                                {getStatusIcon(checkin.checkinCompleted)}
                                <span className="text-xs font-semibold text-ink-700 dark:text-inverse-on-surface">
                                  {checkin.quarter}
                                </span>
                              </div>
                              {checkin.progressScore !== null ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getScoreColor(checkin.progressScore)}`}>
                                  {checkin.progressScore}%
                                </span>
                              ) : (
                                <span className="text-xs text-ink-400 dark:text-outline">-</span>
                              )}
                              {checkin.managerComment && (
                                <p className="text-[10px] text-ink-500 dark:text-outline mt-1 line-clamp-1">
                                  {checkin.managerComment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {type === 'department' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {data.employeeCount}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Employees</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-4 text-center">
                      <p className="text-2xl font-bold text-primary dark:text-primary-300">
                        {data.totalGoals}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Total Goals</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {data.avgScore}%
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Avg Score</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-sand-50 dark:bg-dark-bg p-4">
                    <h4 className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface mb-3">
                      Sheet Status Breakdown
                    </h4>
                    <div className="flex items-center gap-3">
                      {Object.entries(data.sheets || {}).map(([status, count]) => (
                        <div key={status} className="flex-1 text-center">
                          <div className={`
                            h-8 rounded-lg flex items-center justify-center font-bold text-sm
                            ${status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : ''}
                            ${status === 'SUBMITTED' ? 'bg-primary/20 text-primary' : ''}
                            ${status === 'RETURNED' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : ''}
                            ${status === 'DRAFT' ? 'bg-sand-200 text-ink-600 dark:bg-dark-surface dark:text-inverse-on-surface' : ''}
                          `}>
                            {count}
                          </div>
                          <p className="text-xs text-ink-500 dark:text-outline mt-1">{status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {type === 'manager' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {data.directReports}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Direct Reports</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-4 text-center">
                      <p className="text-2xl font-bold text-primary dark:text-primary-300">
                        {data.checkinCompletionRate}%
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Check-in Rate</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {data.avgTeamScore}%
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Avg Team Score</p>
                    </div>
                  </div>
                </div>
              )}

              {type === 'treemap' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {data.goals || 0}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Goals</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-4 text-center">
                      <p className="text-2xl font-bold text-primary dark:text-primary-300">
                        {data.area || data.uom || 'N/A'}
                      </p>
                      <p className="text-xs text-ink-500 dark:text-outline">Category</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}