import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import NotificationDrawer from './NotificationDrawer'
import Badge from '../shared/Badge'
import { NAV_LINKS } from '../../utils/navigation'

export default function Navbar() {
  const { appUser, signOutUser } = useAuth()
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Telos</p>
          <p className="text-lg font-semibold text-ink-900">Purposeful Performance</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDrawer />
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
            key={link.label}
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
