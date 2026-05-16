# Telos AtomQuest Frontend

React 19 / Vite 8 / Tailwind CSS v4 / Firebase Auth / Framer Motion frontend for the Telos goal-setting and performance tracking portal.

## Quick Start

```powershell
cd Telos_Frontend
npm install
npm run dev
```

Requires backend at `VITE_API_URL` (default `http://localhost:3000/api/v1`).

## Judge Guide — Key Features to Verify

| What to test | Login as | Navigate to |
|---|---|---|
| Employee creates & submits goal sheet | `employee@telos.demo` | `/goals` → create sheet → add goals (total 100% weightage) → submit |
| Manager approves with inline edits + diff view | `manager@telos.demo` | `/manager/team` → click report → adjust target/weightage → yellow diff highlights |
| Quarterly check-in with actuals | `employee@telos.demo` | `/goals/sheet/:id/checkin` → save actual achievement |
| Manager completes check-in | `manager@telos.demo` | `/manager/team` → employee → add comment → mark complete |
| Admin unlocks goal/sheet | `admin@telos.demo` | `/admin/unlock` |
| Admin sets notification email | `admin@telos.demo` | `/admin/users` → click notification email cell → set real email |
| View all sent emails (content + status) | `admin@telos.demo` | `/admin/email-logs` |
| Admin audit trail | `admin@telos.demo` | `/admin/audit` |
| Analytics & export | `admin@telos.demo` | `/admin/analytics` |
| Bulk CSV user import | `admin@telos.demo` | `/admin/users` → "Import CSV" |
| Escalation rules | `admin@telos.demo` | `/admin/escalations` |
| Shared goals push | `manager@telos.demo` | `/manager/shared-goals` |
| Dark/light theme toggle | Any | Sidebar bottom |

## Notification Email Feature

All demo accounts use `@telos.demo` emails (not real). To verify email delivery:

1. **Admin** → **User Management** → click the notification email cell for any user → enter a real email address
2. Trigger an email event (e.g. submit sheet, approve, unlock)
3. **Admin** → **Email Logs** — every sent email is logged with full HTML preview, delivery status, and error messages
4. If a real email was set, Resend delivers to that inbox; if not, the content is still visible in Email Logs

The `notificationEmail` field is separate from the login email — changing it does **not** affect how the user logs in. Login always uses the original Firebase email.

## Routes

| Route | Page | Role |
|---|---|---|
| `/login` | Login | Public |
| `/goals` | My Goals | Employee |
| `/goals/sheet/:sheetId` | Goal Sheet | Employee |
| `/goals/sheet/:sheetId/checkin` | Check-in Entry | Employee |
| `/manager/team` | Team Dashboard | Manager |
| `/manager/approve/:sheetId` | Approval (diff view) | Manager |
| `/manager/checkin/:employeeId` | Manager Check-in | Manager |
| `/manager/shared-goals` | Shared Goals | Manager |
| `/admin` | Admin Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/cycles` | Cycle Config | Admin |
| `/admin/thrust-areas` | Thrust Areas | Admin |
| `/admin/unlock` | Unlock Goals | Admin |
| `/admin/escalations` | Escalations | Admin |
| `/admin/completion` | Completion Dashboard | Admin |
| `/admin/audit` | Audit Trail | Admin |
| `/admin/analytics` | Analytics & Export | Admin |
| `/admin/email-logs` | Email Log Viewer | Admin |
| `/settings` | Profile & Settings | All |

## Stack

React 19, Vite 8, React Router, Tailwind CSS v4 (CSS `@theme` tokens), Framer Motion, Firebase Auth, Axios, Heroicons, Recharts (lazy), date-fns, react-hot-toast.

## Dark Mode

Toggle via sidebar bottom button. Persisted in localStorage.
