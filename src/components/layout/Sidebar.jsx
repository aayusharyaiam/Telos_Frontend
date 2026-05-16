import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, Bars3Icon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import useAuth from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { NAV_LINKS, SETTINGS_LINK } from '../../utils/navigation'

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const staggerItem = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function Sidebar() {
  const { appUser } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE

  const isActive = (to) => {
    if (to === '/admin') return location.pathname === '/admin'
    if (to === '/manager/team') return location.pathname === '/manager/team'
    return location.pathname.startsWith(to)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-col items-start gap-1 px-2">
        <img src="/logo-mark.svg" alt="Telos" className="h-10 w-10 object-contain" />
        <p className="font-caption text-caption text-ink-500 dark:text-outline">
          Executive-Tech Management
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.to)
            return (
              <motion.div key={link.label} variants={staggerItem}>
                <NavLink
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-label-bold text-label-bold transition-all duration-200 ${
                    active
                      ? 'bg-primary-container/10 text-primary dark:text-primary-fixed-dim font-bold scale-[0.98]'
                      : 'text-ink-600 dark:text-ink-500 hover:text-primary dark:hover:text-primary-fixed-dim hover:scale-[1.02]'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-primary dark:text-primary-fixed-dim' : ''}`} />
                  {link.label}
                </NavLink>
              </motion.div>
            )
          })}
        </motion.div>
      </nav>

      <div className="mt-auto space-y-1 border-t border-outline-variant/30 dark:border-outline/20 pt-4">
        <NavLink
          to={SETTINGS_LINK.to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive: sActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 font-label-bold text-label-bold transition-all duration-200 ${
              sActive
                ? 'bg-primary-container/10 text-primary dark:text-primary-fixed-dim font-bold'
                : 'text-ink-600 dark:text-ink-500 hover:text-primary dark:hover:text-primary-fixed-dim hover:scale-[1.02]'
            }`
          }
        >
          <SETTINGS_LINK.icon className="h-5 w-5" />
          {SETTINGS_LINK.label}
        </NavLink>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-label-bold text-label-bold text-ink-600 dark:text-ink-500 hover:text-primary dark:hover:text-primary-fixed-dim hover:scale-[1.02] transition-all duration-200"
        >
          {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[256px] z-50 flex-col bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg ring-1 ring-ink-100/10 dark:ring-white/10 shadow-sm p-5">
        {sidebarContent}
      </aside>

      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-3 z-50 rounded-xl bg-white/80 dark:bg-dark-surface/80 p-2 shadow-sm ring-1 ring-ink-100/10"
        >
          <Bars3Icon className="h-5 w-5 text-ink-700 dark:text-inverse-on-surface" />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            >
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed left-0 top-0 h-screen w-[280px] bg-white dark:bg-dark-bg p-5 shadow-xl z-50"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-4 top-4 rounded-xl p-1 text-ink-500 hover:text-ink-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                {sidebarContent}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
