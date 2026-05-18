import { useState, useEffect } from 'react'
import { ChevronDownIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../../hooks/useAuth'
import NotificationDrawer from './NotificationDrawer'
import Badge from '../shared/Badge'
import ConfirmModal from '../shared/ConfirmModal'
import { NAV_LINKS } from '../../utils/navigation'

export default function Navbar() {
  const { appUser, signOutUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE

  const mainNavPaths = links.map(l => l.to)
  const isMainNavRoute = mainNavPaths.includes(location.pathname) || mainNavPaths.some(p => location.pathname.startsWith(p + '/'))
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const showBackButton = pathSegments.length > 1 && !isMainNavRoute && !mainNavPaths.includes('/' + pathSegments[0])

  const getBackPath = () => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    if (pathParts.length > 1) {
      const basePath = '/' + pathParts[0]
      const mainLink = links.find(l => l.to === basePath)
      if (mainLink) return basePath
      return '/'
    }
    return '/'
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'shadow-md bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md'
          : 'bg-white/70 dark:bg-dark-surface/50 backdrop-blur-sm'
      } border-b border-sand-200 dark:border-ink-600/20`}
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(getBackPath())}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sand-100 dark:bg-dark-surface hover:bg-sand-200 dark:hover:bg-dark-bg text-ink-700 dark:text-inverse-on-surface text-sm font-semibold transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          )}
          <div className="md:hidden flex items-center ml-2">
            <img src="/logo-mark.svg" alt="Telos" className="h-7 w-7 object-contain" />
            <span className="text-ink-400 dark:text-outline select-none">|</span>
            <span className="font-caption text-caption text-ink-500 dark:text-outline">
              Purposeful Performance
            </span>
          </div>

          <div className="hidden md:flex items-center">
            <img src="/logo-mark.svg" alt="Telos" className="h-7 w-7 object-contain" />
            <span className="font-display text-headline-md font-bold text-ink-900 dark:text-surface-bright">Telos</span>
            <span className="text-ink-400 dark:text-outline select-none">|</span>
            <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
              Purposeful Performance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDrawer />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                  {appUser?.name || 'Guest'}
                </p>
                <Badge tone="indigo" className="hidden sm:inline">{appUser?.role || 'EMPLOYEE'}</Badge>
              </div>
              <Badge tone="indigo" className="sm:hidden">
                {appUser?.role?.[0] || 'E'}
              </Badge>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1 rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-1.5 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
            >
              <span className="hidden sm:inline">Sign out</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={() => { setShowLogoutConfirm(false); signOutUser() }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="flex gap-2 overflow-x-auto border-t border-sand-200/50 dark:border-outline/10 px-4 py-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-3 py-1.5 font-label-bold text-label-bold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-white'
                  : 'bg-sand-100 dark:bg-dark-surface text-ink-700 dark:text-inverse-on-surface'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </motion.header>
  )
}
