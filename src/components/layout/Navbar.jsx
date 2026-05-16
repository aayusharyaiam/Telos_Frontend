import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../../hooks/useAuth'
import NotificationDrawer from './NotificationDrawer'
import Badge from '../shared/Badge'
import { NAV_LINKS } from '../../utils/navigation'

export default function Navbar() {
  const { appUser, signOutUser } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE

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
        <div className="md:hidden flex items-center gap-1 ml-10">
          <img src="/logo-mark.svg" alt="Telos" className="h-7 w-7 object-contain" />
          <span className="text-ink-400 dark:text-outline mx-1 select-none">|</span>
          <span className="font-caption text-caption text-ink-500 dark:text-outline">
            Purposeful Performance
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <img src="/logo-with-name.svg" alt="Telos AtomQuest" className="h-7 w-auto object-contain" />
          <span className="text-ink-400 dark:text-outline mx-1 select-none">|</span>
          <span className="font-body-sm text-body-sm text-ink-500 dark:text-outline">
            Purposeful Performance
          </span>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDrawer />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                {appUser?.name || 'Guest'}
              </p>
              <Badge tone="indigo">{appUser?.role || 'EMPLOYEE'}</Badge>
            </div>
            <button
              onClick={signOutUser}
              className="flex items-center gap-1 rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 px-3 py-1.5 font-label-bold text-label-bold text-ink-700 dark:text-inverse-on-surface hover:scale-[1.02] transition-all duration-200 hover:shadow-sm"
            >
              Sign out
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

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
