import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserIcon, UsersIcon, ShieldCheckIcon,
  ClipboardDocumentListIcon, ClipboardDocumentCheckIcon,
  ShareIcon, LockOpenIcon, ExclamationTriangleIcon,
  DocumentChartBarIcon, EnvelopeIcon, AdjustmentsHorizontalIcon,
  TagIcon, ArrowTrendingUpIcon, Squares2X2Icon,
  CogIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline'

const sections = [
  {
    role: 'All Users',
    icon: CogIcon,
    color: 'text-ink-500',
    bg: 'bg-ink-100/50',
    items: [
      { label: 'Login', path: '/login', icon: UserIcon, desc: 'Use demo credentials. Click any demo card to auto-fill, or type email + password manually.' },
      { label: 'Profile & Settings', path: '/settings', icon: CogIcon, desc: 'Update your name, email, phone, and department. Available to all roles.' },
      { label: 'Notifications', icon: Squares2X2Icon, desc: 'Bell icon in the top-right navbar. Polls every 30s. Click to navigate and mark read.' },
      { label: 'Dark Mode', icon: Squares2X2Icon, desc: 'Toggle at the bottom of the sidebar. Persisted in your browser.' },
    ],
  },
  {
    role: 'Employee',
    icon: UserIcon,
    color: 'text-primary',
    bg: 'bg-primary-container/10',
    items: [
      { label: 'My Goals Dashboard', path: '/goals', icon: ClipboardDocumentListIcon, desc: 'Overview of your goal sheet status, progress score, and check-in banners.' },
      { label: 'Goal Sheet Editor', path: '/goals/sheet/:id', icon: ClipboardDocumentCheckIcon, desc: 'Add/edit/delete goals. Auto-saves every 30s. Weightage bar shows allocation health. Submit when total = 100%.' },
      { label: 'Quarterly Check-in', path: '/goals/sheet/:id/checkin', icon: ClipboardDocumentCheckIcon, desc: 'Enter actual achievement, date, status, and notes per goal. Quarter selector loads historical data.' },
    ],
  },
  {
    role: 'Manager',
    icon: UsersIcon,
    color: 'text-secondary',
    bg: 'bg-secondary-container/10',
    items: [
      { label: 'Team Dashboard', path: '/manager/team', icon: UsersIcon, desc: 'View all direct reports with their goal sheet status (Not Started, Draft, Submitted, Approved, Returned).' },
      { label: 'Approval with Diff View', path: '/manager/approve/:id', icon: ClipboardDocumentCheckIcon, desc: 'Review submitted sheets. Inline edit targets/weightage — changes highlighted in yellow with strikethrough originals. Approve or return with reason.' },
      { label: 'Manager Check-in', path: '/manager/checkin/:id', icon: ClipboardDocumentListIcon, desc: 'View employee planned vs actual. Add comments and mark check-in complete.' },
      { label: 'Shared Goals', path: '/manager/shared-goals', icon: ShareIcon, desc: 'Create shared goals and push to direct reports. Select primary owner for achievement sync.' },
    ],
  },
  {
    role: 'Admin',
    icon: ShieldCheckIcon,
    color: 'text-tertiary',
    bg: 'bg-tertiary-container/10',
    items: [
      { label: 'Admin Dashboard', path: '/admin', icon: Squares2X2Icon, desc: 'Command center with key metrics — user count, completion KPI, active escalations.' },
      { label: 'User Management', path: '/admin/users', icon: UsersIcon, desc: 'Create/edit users. Bulk CSV import. Set notification email override per user.' },
      { label: 'Cycle Config', path: '/admin/cycles', icon: AdjustmentsHorizontalIcon, desc: 'Force open/close goal setting and Q1-Q4 check-in windows. Archive past cycles.' },
      { label: 'Goal Unlock', path: '/admin/unlock', icon: LockOpenIcon, desc: 'Unlock approved goal sheets or individual locked goals. Requires a reason.' },
      { label: 'Thrust Areas', path: '/admin/thrust-areas', icon: TagIcon, desc: 'CRUD thrust areas used in goal creation forms.' },
      { label: 'Escalations', path: '/admin/escalations', icon: ExclamationTriangleIcon, desc: 'Create escalation rules. Manual run button. Patterns: approval overdue, check-in overdue.' },
      { label: 'Audit Trail', path: '/admin/audit', icon: DocumentChartBarIcon, desc: 'Filterable log of all admin actions: role changes, unlocks, window updates, post-lock edits.' },
      { label: 'Completion Dashboard', path: '/admin/completion', icon: ClipboardDocumentCheckIcon, desc: 'Per-quarter completion status rows for all employees.' },
      { label: 'Analytics & Export', path: '/admin/analytics', icon: ArrowTrendingUpIcon, desc: 'Overview cards, quarter trend chart, goal distribution. Export as JSON/CSV/XLSX.' },
      { label: 'Email Log Viewer', path: '/admin/email-logs', icon: EnvelopeIcon, desc: 'Every sent email logged with HTML preview, delivery status, and error — even when demo addresses are unreachable.' },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="rounded-xl border border-sand-200 dark:border-outline/30 bg-white/50 dark:bg-dark-surface/50 p-2 text-ink-600 dark:text-outline hover:bg-sand-100 dark:hover:bg-dark-bg/50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-display text-ink-900 dark:text-inverse-on-surface">
              Telos AtomQuest — Judge's Guide
            </h1>
            <p className="font-body-lg text-body-lg text-ink-500 dark:text-outline mt-2">
              Everything you need to evaluate the platform. Pick your role below and follow the flows.
            </p>
          </div>
        </div>

        {sections.map((section) => (
          <motion.div
            key={section.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 overflow-hidden"
          >
            <div className={`px-6 py-4 flex items-center gap-3 ${section.bg}`}>
              <section.icon className={`h-6 w-6 ${section.color}`} />
              <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface">
                {section.role}
              </h2>
            </div>
            <div className="divide-y divide-sand-200/30 dark:divide-outline/10">
              {section.items.map((item) => (
                <div key={item.label} className="px-6 py-4 hover:bg-white/50 dark:hover:bg-dark-bg/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`h-4 w-4 ${section.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body-md text-body-md font-semibold text-ink-900 dark:text-inverse-on-surface">
                        {item.label}
                      </p>
                      <p className="font-body-sm text-body-sm text-ink-600 dark:text-outline mt-0.5">
                        {item.desc}
                      </p>
                      {item.path && (
                        <span className="font-caption text-caption text-primary dark:text-primary-fixed-dim mt-1 block">
                          Route: {item.path}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Demo Accounts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface mb-4">
            Demo Accounts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full font-body-md text-body-md">
              <thead>
                <tr className="border-b border-sand-200/50 dark:border-outline/20">
                  <th className="text-left py-2 pr-4 font-semibold text-ink-700 dark:text-inverse-on-surface">Role</th>
                  <th className="text-left py-2 pr-4 font-semibold text-ink-700 dark:text-inverse-on-surface">Email</th>
                  <th className="text-left py-2 font-semibold text-ink-700 dark:text-inverse-on-surface">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/30 dark:divide-outline/10">
                <tr><td className="py-2 pr-4 text-ink-900 dark:text-inverse-on-surface">Employee</td><td className="py-2 pr-4 text-ink-600 dark:text-outline font-mono text-body-sm">employee@telos.demo</td><td className="py-2 text-ink-600 dark:text-outline font-mono text-body-sm">Demo@1234</td></tr>
                <tr><td className="py-2 pr-4 text-ink-900 dark:text-inverse-on-surface">Manager</td><td className="py-2 pr-4 text-ink-600 dark:text-outline font-mono text-body-sm">manager@telos.demo</td><td className="py-2 text-ink-600 dark:text-outline font-mono text-body-sm">Demo@1234</td></tr>
                <tr><td className="py-2 pr-4 text-ink-900 dark:text-inverse-on-surface">Admin</td><td className="py-2 pr-4 text-ink-600 dark:text-outline font-mono text-body-sm">admin@telos.demo</td><td className="py-2 text-ink-600 dark:text-outline font-mono text-body-sm">Demo@1234</td></tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key Features Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface mb-4">
            Key Features to Verify
          </h2>
          <ul className="space-y-3 font-body-md text-body-md text-ink-700 dark:text-inverse-on-surface">
            <li className="flex gap-2"><span className="text-primary shrink-0">→</span> <span><strong>Email Notifications:</strong> Log in as Admin → User Management → set a notification email on any user. Trigger events (submit sheet, approve, unlock). Check <strong>Email Logs</strong> for HTML preview and delivery status.</span></li>
            <li className="flex gap-2"><span className="text-primary shrink-0">→</span> <span><strong>Diff View:</strong> Manager approval page shows yellow-highlighted edits with strikethrough originals when targets or weightage are adjusted.</span></li>
            <li className="flex gap-2"><span className="text-primary shrink-0">→</span> <span><strong>Code Splitting:</strong> Initial JS load is 551 kB (51% smaller than 1,131 kB). Recharts (390 kB) only loads on AnalyticsPage.</span></li>
            <li className="flex gap-2"><span className="text-primary shrink-0">→</span> <span><strong>Weightage Bar:</strong> Real-time visual with color coding (green=100%, red=over, yellow warning above 90%).</span></li>
            <li className="flex gap-2"><span className="text-primary shrink-0">→</span> <strong>Pre-seeded data:</strong> Employee already has a submitted goal sheet with 4 goals and Q1 check-in data. Manager has a sheet to review.</li>
          </ul>
        </motion.div>

        {/* Integration Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/80 dark:bg-dark-surface/70 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10 dark:ring-outline/20 p-6"
        >
          <h2 className="font-headline-md text-headline-md text-ink-900 dark:text-inverse-on-surface mb-4">
            Integrations
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Email Notifications Enabled
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-container/20 text-primary dark:bg-primary/20 dark:text-primary-300">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Microsoft Teams Webhook
            </span>
          </div>
          <p className="mt-3 font-body-sm text-body-sm text-ink-500 dark:text-outline">
            Teams webhook notifications are sent for: Goal Sheet Submitted, Goal Sheet Approved, and Escalations.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
