import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getNotifications, markNotificationRead } from '../../api/notifications.api'

const AUTO_DISMISS_MS = 4000

export default function Notifier() {
  const navigate = useNavigate()
  const [popups, setPopups] = useState([])
  const seenIds = useRef(new Set())
  const timers = useRef({})
  const hoveredIds = useRef(new Set())

  const clearTimer = useCallback((id) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const dismissPopup = useCallback((id, markRead = false) => {
    clearTimer(id)
    hoveredIds.current.delete(id)
    setPopups((prev) => prev.filter((p) => p.id !== id))
    if (markRead) {
      markNotificationRead(id).catch(() => {})
    }
  }, [clearTimer])

  const handleClick = useCallback((notification) => {
    dismissPopup(notification.id, true)
    if (notification.link) navigate(notification.link)
  }, [dismissPopup, navigate])

  const startTimer = useCallback((id) => {
    clearTimer(id)
    const timer = setTimeout(() => {
      dismissPopup(id, true) // Mark as read on auto-dismiss
    }, AUTO_DISMISS_MS)
    timers.current[id] = timer
  }, [clearTimer, dismissPopup])

  const pauseTimer = useCallback((id) => {
    hoveredIds.current.add(id)
    clearTimer(id)
  }, [clearTimer])

  const resumeTimer = useCallback((id) => {
    if (hoveredIds.current.has(id)) {
      hoveredIds.current.delete(id)
      startTimer(id)
    }
  }, [startTimer])

  useEffect(() => {
    let mounted = true

    async function poll() {
      try {
        const data = await getNotifications()
        if (!mounted) return

        for (const n of data) {
          if (n.isRead) continue
          if (seenIds.current.has(n.id)) continue
          seenIds.current.add(n.id)

          const popup = { ...n, timestamp: Date.now() }
          setPopups((prev) => [...prev, popup])
          startTimer(n.id)
        }
      } catch {
        /* polling error */
      }
    }

    poll()
    const interval = setInterval(poll, 15000)
    return () => {
      mounted = false
      clearInterval(interval)
      Object.values(timers.current).forEach(clearTimer)
    }
  }, [startTimer, clearTimer])

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {popups.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto rounded-2xl bg-white dark:bg-dark-surface shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20 border-l-4 border-primary-container overflow-hidden cursor-pointer"
            onClick={() => handleClick(n)}
            onMouseEnter={() => pauseTimer(n.id)}
            onMouseLeave={() => resumeTimer(n.id)}
            layout
          >
            <div className="flex items-start justify-between p-3 pl-4">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface truncate">
                  {n.title}
                </p>
                {n.message ? (
                  <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                ) : null}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  dismissPopup(n.id, true)
                }}
                className="shrink-0 rounded-full p-1 text-ink-400 dark:text-outline hover:bg-sand-100 dark:hover:bg-dark-bg transition-colors"
                title="Dismiss"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}