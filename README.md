# Telos AtomQuest Frontend

This is the React/Vite frontend for the Telos AtomQuest goal setting and performance tracking portal.

For the complete full-stack documentation, feature list, environment variables, backend routes, database notes, demo accounts, and manual test flows, read the root project README:

```txt
C:\Users\aayus\working-ly\Telos_AtomQuest\README.md
```

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS v4 (CSS-based theme in `src/index.css`)
- Framer Motion (animations, page transitions, micro-interactions)
- Firebase client auth
- Axios
- Heroicons
- Recharts
- date-fns
- react-hot-toast
- react-hook-form

## Project Structure

```txt
src/
├── api/                    # 11 API wrappers (axiosInstance, auth, goals, checkins, etc.)
├── components/
│   ├── layout/             # AppShell, Navbar, Sidebar, NotificationDrawer, Notifier, PageHeader
│   ├── goals/              # WeightageBar, GoalCard, ProgressScoreBadge
│   └── shared/             # Badge, ConfirmModal, Modal, Table, EmptyState, StatCard, FullScreenLoader
├── context/                # AuthContext (Firebase auth + app user sync), ThemeContext (dark/light)
├── firebase/               # Firebase config
├── hooks/                  # useAuth, useGoalSheet, useCurrentCycle, useWindowStatus
├── pages/
│   ├── auth/               # LoginPage
│   ├── employee/           # MyGoalsPage, GoalSheetPage, CheckinEntryPage
│   ├── manager/            # TeamDashboardPage, ApprovalPage, ManagerCheckinPage, SharedGoalsPage
│   ├── admin/              # AdminDashboardPage, UserManagementPage, CycleConfigPage,
│   │                       # ThrustAreasPage, UnlockGoalsPage, EscalationsPage,
│   │                       # CompletionDashboardPage, AuditLogPage, AnalyticsPage
│   └── shared/             # SettingsPage
├── routes/                 # AppRouter (18 routes with ProtectedRoute + AnimatePresence)
└── utils/                  # constants, dateHelpers, navigation, scoreComputer
```

## Pages & Routes

| Route | Page | Role |
|---|---|---|
| `/login` | LoginPage | Public |
| `/goals` | MyGoalsPage | Employee |
| `/goals/sheet/:sheetId` | GoalSheetPage | Employee |
| `/goals/sheet/:sheetId/checkin` | CheckinEntryPage | Employee |
| `/manager/team` | TeamDashboardPage | Manager |
| `/manager/approve/:sheetId` | ApprovalPage (inline target/weightage edits + diff view) | Manager |
| `/manager/checkin/:employeeId` | ManagerCheckinPage | Manager |
| `/manager/shared-goals` | SharedGoalsPage | Manager |
| `/admin` | AdminDashboardPage | Admin |
| `/admin/users` | UserManagementPage | Admin |
| `/admin/cycles` | CycleConfigPage | Admin |
| `/admin/thrust-areas` | ThrustAreasPage | Admin |
| `/admin/unlock` | UnlockGoalsPage | Admin |
| `/admin/escalations` | EscalationsPage | Admin |
| `/admin/completion` | CompletionDashboardPage | Admin |
| `/admin/audit` | AuditLogPage | Admin |
| `/admin/analytics` | AnalyticsPage | Admin |
| `/settings` | SettingsPage | All |

## Design System

### Glassmorphism
All cards follow `rounded-2xl bg-white/80 backdrop-blur-lg shadow-sm ring-1 ring-ink-100/10` with dark mode variants using `dark:bg-dark-surface/70 dark:ring-outline/20`.

### Color Palette
- **ink-* (grays)**: Headings, body, muted text
- **sand-* (warm grays)**: Backgrounds, borders
- **primary / primary-container**: Brand indigo (#3525cd / #4f46e5)
- **secondary / secondary-container**: Success emerald (#006c49 / #6cf8bb)
- **tertiary**: Amber warning tones
- **error / error-container**: Red states (#ba1a1a / #ffdad6)

### Dark Mode
Toggle via ThemeContext (`src/context/ThemeContext.jsx`). Persisted in localStorage. Uses `dark:` Tailwind variant on all components.

### Typography
- **Headings**: Sora (Google Font)
- **Body**: Manrope (Google Font)
- Font size tokens via Tailwind `@theme`: `display`, `headline-lg`, `headline-md`, `body-md`, `body-sm`, `label-bold`, `stat-value`, `caption`

### Background
- Light: radial gradient blobs (indigo top-left, emerald top-right) + linear gradient sand-50 → sand-100
- Dark: solid `#0f172a` with subtle gradient blobs

## Animations (Framer Motion)

| Component | Animation |
|---|---|
| **Page transitions** | AnimatePresence wrapper with fade + slide-up (0.35s) |
| **Sidebar** | Staggered nav links (0.05s delay), mobile slide-in drawer |
| **Navbar** | Fade-down entrance, scroll-driven shadow |
| **StatCard** | Count-up number, staggered entrance, hover lift (y: -4) |
| **Badge** | Scale pop (0→1) on mount |
| **GoalCard** | Staggered list (0.05s delay per row), hover ring accent |
| **WeightageBar** | Animated fill width tween, color transition |
| **ProgressScoreBadge** | Count-up + spring scale entrance |
| **Modal / ConfirmModal** | Overlay fade, card slide-up + scale (0.95→1) |
| **EmptyState** | Fade + slide-up, icon float breathe |
| **PageHeader** | Staggered children (title → subtitle → chips → actions) |
| **Table** | Staggered row entrance (0.05s per row) |
| **LoginPage** | Staggered hero + credential cards, spring animations |
| **All hover states** | scale(1.02) + shadow deepen on clickable elements |

## Environment

Create or update:

```txt
Telos_Frontend/.env
```

Expected variables:

```txt
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Run

```powershell
cd C:\Users\aayus\working-ly\Telos_AtomQuest\Telos_Frontend
npm install
npm run dev
```

Open: `http://localhost:5173/login`

## Build

```powershell
cd C:\Users\aayus\working-ly\Telos_AtomQuest\Telos_Frontend
npm.cmd run build
```

## Performance (Code Splitting)

All 18 pages are lazy-loaded via `React.lazy()` for route-level code-splitting. Each page is a separate chunk loaded on-demand.

| Metric | Before (eager) | After (lazy) | Improvement |
|---|---|---|---|
| Initial JS download | **1,131 kB** (1 bundle) | **551 kB** (core) | **51% smaller** |
| Recharts library | Bundled in main | 390 kB lazy chunk | AnalyticsPage only |
| Per-page chunks | — | 2–35 kB each | Instant nav |
| Total chunks | 1 monolithic | 35 granular | Optimal sharing |

The 551 kB core chunk contains React 19, framer-motion, react-router-dom, Heroicons, and shared UI components — the unavoidable framework tax. Gzip compresses it to ~176 kB over the wire.

Non-blocking build warning: Vite flags chunks >500 kB (the core chunk). This is expected for the framework bundle and does not affect runtime behavior. All application code is properly split. To adjust, set `build.chunkSizeWarningLimit` in `vite.config.js`.

Build output:

```txt
dist/assets/index.html                  0.64 kB
dist/assets/index-*.css                 55.65 kB
dist/assets/index-*.js                 551.35 kB  (core framework)
dist/assets/AnalyticsPage-*.js         390.23 kB  (Recharts)
dist/assets/LoginPage-*.js              35.41 kB
dist/assets/PageHeader-*.js             36.59 kB
dist/assets/UserManagementPage-*.js     12.19 kB
dist/assets/SharedGoalsPage-*.js        11.65 kB
dist/assets/ApprovalPage-*.js            9.99 kB
... (28 more chunks, all <9 kB)
```

## Key Components Added

### Layout
- **`Notifier`** — Floating popup toast system that polls notifications every 15s. New notifications appear as rounded-rect cards in top-right. Click X to dismiss (marks read). Auto-dismiss after 4s leaves unread in drawer. Clicking navigates + marks read.
- **`NotificationDrawer`** — Standalone notification drawer with polling, mark-all-read, click-outside-close, and navigation on click.
- **`Navbar`** — Uses NotificationDrawer component; role-based mobile nav links; framer-motion fade-down entrance.
- **`Sidebar`** — Staggered nav links with spring entrance; mobile slide-in drawer with AnimatePresence; theme toggle.

### Goals
- **`WeightageBar`** — Visual bar showing allocation progress with remaining percent (e.g. "72% allocated — 28% remaining", green=100%, red=over, primary=under). Animated fill on weightage change.
- **`GoalCard`** — Single goal row with title, shared badge, weightage input, delete/locked actions. Staggered entrance.
- **`ProgressScoreBadge`** — Color-coded score display (green≥80%, yellow≥50%, red<50%, "N/A" for no data). Count-up animation.

### Shared
- **`StatCard`** — Count-up number animation, staggered entrance, hover lift (y: -4), left accent border.
- **`Modal`** — Generic modal with overlay, escape key, and click-outside-to-close. Slide-up + scale animation.
- **`ConfirmModal`** — Confirmation modal with danger/warning/primary tones. Slide-up + scale animation.
- **`Table`** — Generic data table with column config, staggered row entrance, dark mode.
- **`Badge`** — Scale pop on mount, 5 tones (slate, indigo, emerald, amber, red).
- **`EmptyState`** — Fade-in with icon float animation.
- **`FullScreenLoader`** — Fade-in + scale overlay with glassmorphism.

## Custom Hooks

- **`useGoalSheet`** — Fetches/creates goal sheet, provides `loading`, `error`, `refetch`, `ensureSheet`.
- **`useCurrentCycle`** — Fetches active cycle with windows.
- **`useWindowStatus`** — Computes whether a given quarter window is open/closed/forced.

## Key Features

- **Employee**: Goal sheet creation, weightage health bar with remaining percent, >90% warning, auto-save (30s + on-blur), quarterly check-in entry, shared goal "Awaiting owner update" indicator.
- **Manager**: Team overview, approval with inline target/weightage edits and diff view (yellow highlight on edits, strikethrough originals), check-in completion, shared goals push.
- **Admin**: Full CRUD users, CSV bulk user import (upload or paste), force open/close windows, archive past cycles, unlock goals, escalation rules, audit trail with filters, dynamic check-in completion KPI, analytics with Recharts charts, CSV/XLSX export.
- **All**: Dark/light theme toggle, Editable Settings page (name, email, phone, department), notification drawer with popup toasts, role-based navigation, glassmorphism design, Framer Motion animations.

## Problem Statement Alignment

Covered in the UI:
- Employee goal sheet creation with thrust areas, UoM, target, weightage, validation feedback, submission, and locked/read-only states.
- Manager approval journey with inline target/weightage edits, return reason, approval confirmation, and visible diff review.
- Quarterly employee achievement entry with actuals, statuses, notes, shared-goal owner indicators, and computed progress score display.
- Manager check-in page with planned vs actual data and structured comments.
- Admin pages for user hierarchy management, cycle windows, unlock exceptions, completion dashboard, audit trail, reports/exports, escalations, thrust areas, and analytics.

Known problem statement gaps:
- Microsoft Entra ID / Azure AD SSO is not implemented; the app currently uses Firebase Email/Password Auth.
- Microsoft Teams notifications/adaptive cards/deep links are not implemented.
- Automatic Azure AD org hierarchy sync is not implemented; hierarchy is managed through the admin user module.

## Notes

- Tailwind v4 theme tokens live in `src/index.css` (v3 `tailwind.config.js` removed — all config via `@theme` CSS directives).
- The app expects the backend API at `VITE_API_URL`.
- Role-based navigation is defined in `src/utils/navigation.js`.
- Score computation formulas mirror backend (`src/utils/scoreComputer.js`).
- Dark mode toggled via ThemeContext with localStorage persistence.
- No test files yet — manual smoke tests are in the root README.
