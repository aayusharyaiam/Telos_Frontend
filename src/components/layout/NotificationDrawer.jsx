import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const drawerRef = useRef(null)

  async function load() {
    try {
      const data = await getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.isRead).length)
    } catch { }
  }

  useEffect(() => {
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
    } catch { }
  }

  function handleNotificationClick(notification) {
    if (notification.link) navigate(notification.link)
    setOpen(false)
  }

  return (
    <div className="relative" ref={drawerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 text-ink-600 transition-colors hover:bg-ink-100"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-ink-100">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              ) : null}
              <button onClick={() => setOpen(false)}>
                <XMarkIcon className="h-4 w-4 text-ink-500" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-sand-50 ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                >
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>{n.title}</p>
                  <p className="text-xs text-ink-500">{n.message}</p>
                  <p className="mt-1 text-[11px] text-ink-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
