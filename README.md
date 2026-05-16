# Telos AtomQuest Frontend

React 19 / Vite 8 / Tailwind CSS v4 / Firebase Auth / Framer Motion frontend for the Telos goal-setting and performance tracking portal.

---

## Setup

### Environment

```txt
# Telos_Frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### Run

```powershell
cd Telos_Frontend
npm install
npm run dev                    # http://localhost:5173/login
npm run build                  # production build
```

---

## Features by Role

### Employee

| Feature | Implementation |
|---|---|
| **Goal Sheet Creation** | Create/edit goals with title, thrust area, UoM, target, weightage, dates. Auto-save to localStorage every 30s and on blur. |
| **Weightage Bar** | Real-time visual bar — shows allocated/total percentage. Green at 100%, red if over, yellow warning >90%. |
| **Validation** | At least 1 goal, max 8, min 10% per goal, total must equal exactly 100% before submission. |
| **Goal Lifecycle** | Goals editable in DRAFT/RETURNED states. Submitted goals locked. Approved goals require admin unlock. |
| **Quarterly Check-ins** | Enter actual achievement, actual date, status, and notes per goal per quarter. Quarter selector loads historical data. |
| **Shared Goals** | "Shared" badge, read-only title/target, editable weightage only. "Awaiting owner update" indicator when primary owner hasn't entered data. |
| **Progress Score** | Auto-computed per UoM type (see Backend README for formulas). Displayed as color-coded badge (green≥80%, yellow≥50%, red<50%). |

### Manager

| Feature | Implementation |
|---|---|
| **Team Dashboard** | List all direct reports with goal sheet status (Not Started, Draft, Submitted, Approved, Returned). |
| **Approval with Diff View** | Inline target/weightage edits on submitted sheets. Changes highlighted with yellow background + strikethrough original values. Collapsible "Show diff view" panel. |
| **Approve / Return** | Approve locks goals. Return requires reason (min 20 chars). Both create notifications + emails. |
| **Manager Check-in** | View employee planned vs actual data per quarter. Add manager comments and mark check-in complete. |
| **Shared Goals Push** | Create shared goals, select recipients from direct reports, set primary owner. Pushes linked goal rows to recipient sheets. |

### Admin

| Feature | Implementation |
|---|---|
| **User Management** | Create users individually. Bulk import via CSV upload or paste. Edit roles, activation status, reporting hierarchy. |
| **Notification Email Override** | Per-user `notificationEmail` field — set a real email for notification delivery without changing the user's login identity. |
| **Email Log Viewer** | Paginated list of every sent email. Expandable HTML preview, success/failure status, error messages, event type. |
| **Cycle & Window Config** | Create cycles, force open/close goal setting and Q1-Q4 check-in windows. Archive past cycles. |
| **Goal Unlock** | Unlock entire approved sheets or individual locked goals. Requires reason. Returns to RETURNED state. |
| **Thrust Areas** | CRUD thrust areas used in goal creation forms. Graceful fallback to defaults if API fails. |
| **Escalation Rules** | Create/enable/disable rules. Manual run button. Patterns: goal setting overdue, approval overdue, check-in overdue. |
| **Audit Trail** | Filterable log of all admin actions: post-lock edits, role changes, unlocks, window changes, escalations. |
| **Analytics & Export** | Overview cards, quarter trend chart (Recharts), goal distribution. Export reports as JSON, CSV, or XLSX. |
| **Completion Dashboard** | Per-quarter completion status rows for all employees. |

### All Users

| Feature | Implementation |
|---|---|
| **Logout Confirmation** | Sign-out button triggers a `ConfirmModal` with "Are you sure you want to sign out?" — prevents accidental logouts. |
| **Judge's Guide** | `/help` page with role-by-role feature overview, demo accounts table, and key features to verify. Public route — accessible without login. Link shown on LoginPage. |
| **Notification Drawer** | Bell icon in navbar shows unread count. Drawer polls every 30s. Click to navigate + mark read. Mark all read button. |
| **Toast Notifications** | `react-hot-toast` for all success/error states across every page. |
| **Settings** | Editable name, email, phone, department. Email changes sync to Firebase Auth. |
| **Dark/Light Mode** | Toggle via sidebar. Persisted in localStorage. Full dark mode using Tailwind `dark:` variants. |
| **Glassmorphism UI** | All cards: `rounded-2xl bg-white/80 backdrop-blur-lg shadow-sm ring-1`. |
| **Framer Motion Animations** | Staggered list entrances, page transitions (fade + slide-up), hover lifts, count-up numbers, scale pops on badges. |
| **Role-Based Navigation** | Sidebar shows different links per role. Unauthorized routes redirect to home. |
| **Skeleton Loaders** | All async pages show animated skeleton placeholders during data fetch. |
| **Empty States** | Friendly empty-state cards when no data exists (no goals, no users, no emails, etc.). |

---

## Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/help` | Judge's Guide | Public |
| `/goals` | My Goals Dashboard | Employee+ |
| `/goals/sheet/:sheetId` | Goal Sheet Editor | Employee+ |
| `/goals/sheet/:sheetId/checkin` | Quarterly Check-in | Employee+ |
| `/manager/team` | Team Dashboard | Manager+ |
| `/manager/approve/:sheetId` | Approval with Diff View | Manager+ |
| `/manager/checkin/:employeeId` | Manager Check-in | Manager+ |
| `/manager/shared-goals` | Shared Goals Management | Manager+ |
| `/admin` | Admin Command Center | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/cycles` | Cycle/Window Config | Admin |
| `/admin/thrust-areas` | Thrust Areas | Admin |
| `/admin/unlock` | Goal Unlock | Admin |
| `/admin/escalations` | Escalations | Admin |
| `/admin/completion` | Completion Dashboard | Admin |
| `/admin/audit` | Audit Trail | Admin |
| `/admin/analytics` | Analytics & Export | Admin |
| `/admin/email-logs` | Email Log Viewer | Admin |
| `/settings` | Profile & Settings | All |
| `/notifications` | Notification Drawer | All (via navbar bell icon) |

---

## Performance — Code Splitting

All 19 pages are lazy-loaded via `React.lazy()`. Each page is a separate chunk.

| Metric | Before (eager) | After (lazy) | Improvement |
|---|---|---|---|
| Initial JS | 1,131 kB (monolithic) | 551 kB (core framework) | **51% smaller** |
| Recharts | Included in main bundle | 390 kB lazy chunk | AnalyticsPage only |
| Per-page scripts | — | 2–35 kB each | Instant navigation |
| Total chunks | 1 | 35 granular | Optimal sharing |

Core 551 kB includes React 19, framer-motion, react-router-dom, Heroicons, shared UI — gzip compresses to ~176 kB.

---

## Stack

- **React 19** — UI framework
- **Vite 8** — Build tool with HMR
- **React Router v6** — Client-side routing with `ProtectedRoute` guard
- **Tailwind CSS v4** — Utility-first CSS with `@theme` tokens in `index.css`
- **Framer Motion** — Page transitions, staggered lists, count-up, hover effects
- **Firebase Auth** — Email/password authentication
- **Axios** — HTTP client with interceptor for Firebase Bearer tokens
- **Heroicons** — 24px outline icon set
- **Recharts** — Charts (lazy-loaded on AnalyticsPage only)
- **date-fns** — Date formatting
- **react-hot-toast** — Toast notifications for all success/error states
- **react-hook-form** — Form state management (used in login)

---

## Project Structure

```
src/
├── api/               # 11 API wrappers (auth, goals, checkins, admin, reports, etc.)
├── components/
│   ├── layout/        # AppShell, Navbar, Sidebar, NotificationDrawer, Notifier, PageHeader
│   ├── goals/         # WeightageBar (animated), GoalCard, ProgressScoreBadge
│   └── shared/        # Badge, Modal, ConfirmModal, Table, EmptyState, StatCard, Skeleton
├── context/           # AuthContext (Firebase auth ↔ app user sync), ThemeContext
├── firebase/          # Firebase config init
├── hooks/             # useAuth, useGoalSheet, useCurrentCycle, useWindowStatus
├── pages/
│   ├── auth/          # LoginPage
│   ├── employee/      # MyGoalsPage, GoalSheetPage, CheckinEntryPage
│   ├── manager/       # TeamDashboardPage, ApprovalPage, ManagerCheckinPage, SharedGoalsPage
│   ├── admin/         # 10 pages (dashboard, users, cycles, thrust-areas, unlock,
│   │                  # escalations, completion, audit, analytics, email-logs)
│   └── shared/        # SettingsPage, HelpPage
├── routes/            # AppRouter (lazy routes + ProtectedRoute + AnimatePresence)
└── utils/             # constants, dateHelpers, navigation, scoreComputer
```

---

## Design System

- **Glassmorphism**: All cards use `rounded-2xl bg-white/80 backdrop-blur-lg shadow-sm ring-1`
- **Colors**: Ink (grays), Sand (warm grays), Primary (indigo `#3525cd`), Secondary (emerald `#006c49`), Tertiary (amber), Error (red)
- **Dark Mode**: Toggle via sidebar → localStorage persist → Tailwind `dark:` variants
- **Typography**: Sora (headings), Manrope (body) — Google Fonts
- **Background**: Radial gradient blobs (indigo/emerald) on light, solid `#0f172a` on dark
- **Animations**: Framer Motion for page transitions (fade+slide-up 0.35s), staggered lists (0.05s delay), hover lift (y: -4), count-up on StatCard/ProgressScoreBadge, scale pop on Badge

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `http://localhost:3000/api/v1`) |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
