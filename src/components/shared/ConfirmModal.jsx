import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
  tone = 'primary',
}) {
  const toneClasses = {
    primary: 'bg-primary-container text-white hover:bg-primary',
    danger: 'bg-error text-white hover:bg-red-700',
    warning: 'bg-tertiary-fixed-dim text-ink-900 hover:bg-amber-500',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-surface p-6 shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <h3 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
              {title}
            </h3>
            <p className="mt-2 font-body-md text-body-md text-ink-600 dark:text-outline">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl px-4 py-2 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface transition hover:bg-sand-100 dark:hover:bg-dark-bg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-xl px-5 py-2 font-label-bold text-label-bold shadow-sm transition hover:scale-[1.02] disabled:opacity-50 ${toneClasses[tone] || toneClasses.primary}`}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
