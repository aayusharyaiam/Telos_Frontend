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
- Tailwind CSS v4
- Firebase client auth
- Axios
- Heroicons
- Recharts

## Main Frontend Areas

- Auth:
  - `src/pages/auth/LoginPage.jsx`
  - `src/context/AuthContext.jsx`
  - `src/firebase/config.js`
- Routing:
  - `src/routes/AppRouter.jsx`
- API wrappers:
  - `src/api`
- Layout:
  - `src/components/layout/AppShell.jsx`
  - `src/components/layout/Navbar.jsx`
  - `src/components/layout/Sidebar.jsx`
- Shared UI:
  - `src/components/shared`
- Employee pages:
  - `src/pages/employee/MyGoalsPage.jsx`
  - `src/pages/employee/GoalSheetPage.jsx`
  - `src/pages/employee/CheckinEntryPage.jsx`
- Manager pages:
  - `src/pages/manager/TeamDashboardPage.jsx`
  - `src/pages/manager/ApprovalPage.jsx`
  - `src/pages/manager/ManagerCheckinPage.jsx`
  - `src/pages/manager/SharedGoalsPage.jsx`
- Admin pages:
  - `src/pages/admin/AdminDashboardPage.jsx`
  - `src/pages/admin/UserManagementPage.jsx`
  - `src/pages/admin/CycleConfigPage.jsx`
  - `src/pages/admin/ThrustAreasPage.jsx`
  - `src/pages/admin/UnlockGoalsPage.jsx`
  - `src/pages/admin/EscalationsPage.jsx`
  - `src/pages/admin/CompletionDashboardPage.jsx`
  - `src/pages/admin/AuditLogPage.jsx`
  - `src/pages/admin/AnalyticsPage.jsx`

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

Open:

```txt
http://localhost:5173/login
```

## Build

```powershell
cd C:\Users\aayus\working-ly\Telos_AtomQuest\Telos_Frontend
npm.cmd run build
```

Current status:

- Production build passes.
- Vite shows a non-blocking large chunk warning.

## Notes

- Tailwind v4 theme tokens live in `src/index.css`.
- Do not move theme tokens back only to `tailwind.config.js`.
- The app expects the backend API at `VITE_API_URL`.
- Role-based navigation is defined in `src/utils/navigation.js`.
