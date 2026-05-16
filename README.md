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
- Firebase client auth
- Axios
- Heroicons
- Recharts
- date-fns
- react-hot-toast

## Project Structure

```txt
src/
├── api/                    # 11 API wrappers (axiosInstance, auth, goals, checkins, etc.)
├── components/
│   ├── layout/             # AppShell, Navbar, Sidebar, NotificationDrawer, PageHeader
│   ├── goals/              # WeightageBar, GoalCard, ProgressScoreBadge
│   └── shared/             # Badge, ConfirmModal, Modal, Table, EmptyState, StatCard, FullScreenLoader
├── context/                # AuthContext (Firebase auth + app user sync)
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
├── routes/                 # AppRouter (18 routes with ProtectedRoute)
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

Current status:
- Production build passes (~958 KB, ~270 KB gzip).
- Vite shows a non-blocking large-chunk warning.
- 1391 modules transformed.

## Key Components Added

### Layout
- **`NotificationDrawer`** — Standalone notification drawer with polling, mark-all-read, click-outside-close, and navigation on click.
- **`Navbar`** — Uses NotificationDrawer component; role-based mobile nav links.

### Goals
- **`WeightageBar`** — Visual bar showing allocation progress with remaining percent (e.g. "72% allocated — 28% remaining", green=100%, red=over, primary=under).
- **`GoalCard`** — Single goal row with title, shared badge, weightage input, delete/locked actions.
- **`ProgressScoreBadge`** — Color-coded score display (green≥80%, yellow≥50%, red<50%, "N/A" for no data).

### Shared
- **`Modal`** — Generic modal with overlay, escape key, and click-outside-to-close.
- **`Table`** — Generic data table with column config, render functions, and empty state.

## Custom Hooks

- **`useGoalSheet`** — Fetches/creates goal sheet, provides `loading`, `error`, `refetch`, `ensureSheet`.
- **`useCurrentCycle`** — Fetches active cycle with windows.
- **`useWindowStatus`** — Computes whether a given quarter window is open/closed/forced.

## Key Features

- **Employee**: Goal sheet creation, weightage health bar with remaining percent, >90% warning, auto-save (30s + on-blur), quarterly check-in entry, shared goal "Awaiting owner update" indicator.
- **Manager**: Team overview, approval with inline target/weightage edits and diff view (yellow highlight on edits, strikethrough originals), check-in completion, shared goals push.
- **Admin**: Full CRUD users, CSV bulk user import (upload or paste), force open/close windows, archive past cycles, unlock goals, escalation rules, audit trail with filters, dynamic check-in completion KPI, analytics with Recharts charts, CSV/XLSX export.
- **All**: Editable Settings page (name, email, phone, department), notification drawer with 30s polling, role-based navigation.

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
- No test files yet — manual smoke tests are in the root README.
