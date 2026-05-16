import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getNotifications, markAllNotificationsRead } from '../../api/notifications.api'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationDrawer() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [bounce, setBounce] = useState(false)
  const drawerRef = useRef(null)
  const prevCount = useRef(0)

  async function load() {
    try {
      const data = await getNotifications()
      setNotifications(data)
      const count = data.filter((n) => !n.isRead).length
      if (count > prevCount.current && prevCount.current > 0) {
        setBounce(true)
        setTimeout(() => setBounce(false), 600)
      }
      prevCount.current = count
      setUnreadCount(count)
    } catch { /* ignore polling error */ }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* ignore mark-all-read error */ }
  }

  function handleNotificationClick(notification) {
    if (notification.link) navigate(notification.link)
    setOpen(false)
  }

  return (
    <div className="relative" ref={drawerRef}>
      <motion.button
        animate={bounce ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 text-ink-600 dark:text-ink-500 transition-colors hover:bg-sand-100 dark:hover:bg-dark-bg"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white dark:bg-dark-surface shadow-xl ring-1 ring-ink-100/10 dark:ring-outline/20"
          >
            <div className="flex items-center justify-between border-b border-sand-200/50 dark:border-outline/20 px-4 py-3">
              <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                Notifications
              </p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 font-label-bold text-label-bold text-primary dark:text-primary-fixed-dim"
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                ) : null}
                <button onClick={() => setOpen(false)}>
                  <XMarkIcon className="h-4 w-4 text-ink-500 dark:text-outline" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center font-body-md text-body-md text-ink-500 dark:text-outline">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full border-b border-sand-200/30 dark:border-outline/10 px-4 py-3 text-left transition-colors hover:bg-sand-50 dark:hover:bg-dark-bg ${
                      !n.isRead ? 'bg-primary/5 dark:bg-primary-fixed-dim/5' : ''
                    }`}
                  >
                    <p
                      className={`font-body-md text-body-md ${
                        !n.isRead
                          ? 'font-semibold text-ink-900 dark:text-inverse-on-surface'
                          : 'text-ink-700 dark:text-inverse-on-surface/70'
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-ink-500 dark:text-outline">{n.message}</p>
                    <p className="mt-1 font-caption text-caption text-ink-400 dark:text-outline/60">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
