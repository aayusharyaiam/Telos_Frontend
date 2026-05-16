import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import FullScreenLoader from '../components/shared/FullScreenLoader'

const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const MyGoalsPage = lazy(() => import('../pages/employee/MyGoalsPage'))
const GoalSheetPage = lazy(() => import('../pages/employee/GoalSheetPage'))
const CheckinEntryPage = lazy(() => import('../pages/employee/CheckinEntryPage'))
const TeamDashboardPage = lazy(() => import('../pages/manager/TeamDashboardPage'))
const ApprovalPage = lazy(() => import('../pages/manager/ApprovalPage'))
const ManagerCheckinPage = lazy(() => import('../pages/manager/ManagerCheckinPage'))
const SharedGoalsPage = lazy(() => import('../pages/manager/SharedGoalsPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const CycleConfigPage = lazy(() => import('../pages/admin/CycleConfigPage'))
const AuditLogPage = lazy(() => import('../pages/admin/AuditLogPage'))
const CompletionDashboardPage = lazy(() => import('../pages/admin/CompletionDashboardPage'))
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'))
const ThrustAreasPage = lazy(() => import('../pages/admin/ThrustAreasPage'))
const EscalationsPage = lazy(() => import('../pages/admin/EscalationsPage'))
const UnlockGoalsPage = lazy(() => import('../pages/admin/UnlockGoalsPage'))
const EmailLogPage = lazy(() => import('../pages/admin/EmailLogPage'))
const SettingsPage = lazy(() => import('../pages/shared/SettingsPage'))
const HelpPage = lazy(() => import('../pages/shared/HelpPage'))

function ProtectedRoute({ allowedRoles, children }) {
  const { appUser, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!appUser) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(appUser.role)) return <Navigate to="/" replace />

  return children
}

function RootRedirect() {
  const { appUser, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!appUser) return <Navigate to="/login" replace />

  if (appUser.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (appUser.role === 'MANAGER') return <Navigate to="/manager/team" replace />
  return <Navigate to="/goals" replace />
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<FullScreenLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/help" element={<HelpPage />} />

        <Route
          path="/goals"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
              <MyGoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals/sheet/:sheetId"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
              <GoalSheetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals/sheet/:sheetId/checkin"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
              <CheckinEntryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/team"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <TeamDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/approve/:sheetId"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <ApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/checkin/:employeeId"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <ManagerCheckinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/shared-goals"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
              <SharedGoalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cycles"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CycleConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/completion"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CompletionDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/thrust-areas"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ThrustAreasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/escalations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EscalationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/unlock"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UnlockGoalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/email-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EmailLogPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
