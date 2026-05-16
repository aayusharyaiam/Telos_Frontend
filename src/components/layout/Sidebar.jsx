import { NavLink } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { NAV_LINKS, SETTINGS_LINK } from '../../utils/navigation'

export default function Sidebar() {
  const { appUser } = useAuth()
  const role = appUser?.role || 'EMPLOYEE'
  const links = NAV_LINKS[role] || NAV_LINKS.EMPLOYEE

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-ink-100 bg-white/70 px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
          T
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Telos</p>
          <p className="text-base font-semibold text-ink-900">Goal Portal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-ink-700 hover:bg-sand-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <NavLink
        to={SETTINGS_LINK.to}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
            isActive
              ? 'bg-primary-600 text-white'
              : 'text-ink-700 hover:bg-sand-100'
          }`
        }
      >
        <SETTINGS_LINK.icon className="h-5 w-5" />
        {SETTINGS_LINK.label}
      </NavLink>
    </aside>
  )
}
