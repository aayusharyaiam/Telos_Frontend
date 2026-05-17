# Telos AtomQuest — Frontend

React 19 + Vite + Tailwind CSS. See [Full Documentation](../Telos_AtomQuest_Documentation.md) for all features.

## Quick Start

```powershell
npm install
npm run dev    # http://localhost:5173/login
npm run build  # production build
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@telos.demo | Demo@1234 |
| Manager | manager@telos.demo | Demo@1234 |
| Admin | admin@telos.demo | Demo@1234 |

## Docker

```powershell
docker compose up -d    # http://localhost (nginx)
```

## Routes

- **Public:** `/login`, `/help`
- **Employee:** `/goals`, `/goals/sheet/:id`, `/goals/sheet/:id/checkin`
- **Manager:** `/manager/team`, `/manager/approve/:id`, `/manager/checkin/:id`, `/manager/shared-goals`
- **Admin:** `/admin`, `/admin/users`, `/admin/cycles`, `/admin/unlock`, `/admin/escalations`, `/admin/analytics`, `/admin/audit`, `/admin/email-logs`
- **All:** `/settings`, `/notifications`

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (@theme tokens)
- React Router v6 (protected routes)
- React Query + react-hook-form
- Framer Motion (animations)
- Firebase Auth
- Recharts (lazy-loaded)
- Heroicons + react-hot-toast

## Performance

- 19 pages lazy-loaded via React.lazy()
- Initial JS: 551 kB (51% smaller after code splitting)
- Recharts: 390 kB lazy chunk (AnalyticsPage only)

## Key Features

- Glassmorphism UI with dark mode toggle
- Diff view for manager approval
- Evidence attachments in quarterly check-ins
- In-app notifications with toast + drawer
- Score badges (green/yellow/red)
- Weightage validation bar
- Skeleton loaders + empty states

See [Full Documentation](../Telos_AtomQuest_Documentation.md) for architecture and feature details.
