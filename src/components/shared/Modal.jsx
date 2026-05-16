import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 dark:bg-black/60 backdrop-blur-sm p-4"
          onClick={(event) => {
            if (event.target === overlayRef.current) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-dark-surface p-6 shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            {title ? (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-xl p-1 text-ink-400 dark:text-outline hover:text-ink-600 dark:hover:text-inverse-on-surface transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
