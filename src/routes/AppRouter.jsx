import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoginPage from '../pages/auth/LoginPage'
import MyGoalsPage from '../pages/employee/MyGoalsPage'
import GoalSheetPage from '../pages/employee/GoalSheetPage'
import CheckinEntryPage from '../pages/employee/CheckinEntryPage'
import TeamDashboardPage from '../pages/manager/TeamDashboardPage'
import ApprovalPage from '../pages/manager/ApprovalPage'
import ManagerCheckinPage from '../pages/manager/ManagerCheckinPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import UserManagementPage from '../pages/admin/UserManagementPage'
import CycleConfigPage from '../pages/admin/CycleConfigPage'
import AuditLogPage from '../pages/admin/AuditLogPage'
import CompletionDashboardPage from '../pages/admin/CompletionDashboardPage'
import AnalyticsPage from '../pages/admin/AnalyticsPage'
import FullScreenLoader from '../components/shared/FullScreenLoader'

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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
