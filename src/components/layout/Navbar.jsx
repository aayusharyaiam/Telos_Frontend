import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notifications.api'
import useAuth from '../../hooks/useAuth'
import Badge from '../shared/Badge'
import { NAV_LINKS } from '../../utils/navigation'

export default function Navbar() {
  const { appUser, signOutUser } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  async function loadNotifications() {
    try {
      setNotifications(await getNotifications())
    } catch (err) {
      setNotifications([])
    }
  }

  useEffect(() => {
    if (!appUser?.id) return
    loadNotifications()
    const intervalId = setInterval(loadNotifications, 30000)
    return () => clearInterval(intervalId)
  }, [appUser?.id])

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    await loadNotifications()
  }

  const handleNotificationClick = async (notification) => {
    if (!notification?.link) return
    try {
      if (!notification.isRead) {
        await markNotificationRead(notification.id)
      }
    } finally {
      await loadNotifications()
      setOpen(false)
      navigate(notification.link)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Telos</p>
          <p className="text-lg font-semibold text-ink-900">Purposeful Performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setOpen((value) => !value)}
              className="relative rounded-full bg-sand-100 p-2 text-ink-700 transition hover:bg-sand-200"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {open ? (
              <div className="absolute right-0 mt-3 w-80 rounded-xl border border-ink-100 bg-white p-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                  <p className="text-sm font-semibold text-ink-900">Notifications</p>
                  <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary-700">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 divide-y divide-ink-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-sm text-ink-500">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => {
                      const isClickable = Boolean(notification.link)
                      const Wrapper = isClickable ? 'button' : 'div'
                      return (
                        <Wrapper
                          key={notification.id}
                          type={isClickable ? 'button' : undefined}
                          onClick={
                            isClickable ? () => handleNotificationClick(notification) : undefined
                          }
                          className={`w-full py-3 text-left ${
                            isClickable ? 'transition hover:bg-sand-50' : ''
                          }`}
                        >
                          <p className={`text-sm ${notification.isRead ? 'font-semibold text-ink-700' : 'font-semibold text-ink-900'}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-ink-600">{notification.message}</p>
                        </Wrapper>
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink-900">{appUser?.name || 'Guest'}</p>
              <Badge tone="indigo">{appUser?.role || 'EMPLOYEE'}</Badge>
            </div>
            <button
              onClick={signOutUser}
              className="flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-300"
            >
              Sign out
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-ink-100 px-4 py-3 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-sand-100 text-ink-700'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
