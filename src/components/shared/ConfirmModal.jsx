import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const toneClasses = {
    primary: 'bg-primary-container text-white hover:bg-primary',
    danger: 'bg-error text-white hover:bg-red-700',
    warning: 'bg-tertiary-fixed-dim text-ink-900 hover:bg-amber-500',
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
          style={{
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-dark-surface p-5 shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
              {title}
            </h3>
            <p className="mt-2 font-body-md text-body-md text-ink-600 dark:text-outline">{message}</p>
            <div className="mt-5 flex justify-end gap-2.5">
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
    </AnimatePresence>,
    document.body
  )
}