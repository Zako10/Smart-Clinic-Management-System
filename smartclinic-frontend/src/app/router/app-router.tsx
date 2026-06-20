import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { GuestRoute, ProtectedRoute, RoleRoute } from '@/app/router/route-guards'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { PaymentsPage } from '@/features/operations/pages/payments-page'
import { ResourceListPage } from '@/features/operations/pages/resource-list-page'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          {
            element: <RoleRoute roles={['Admin']} />,
            children: [{ path: '/clinics', element: <ResourceListPage resource="clinics" /> }],
          },
          {
            element: <RoleRoute roles={['Admin', 'Doctor']} />,
            children: [{ path: '/doctors', element: <ResourceListPage resource="doctors" /> }],
          },
          {
            element: <RoleRoute roles={['Admin', 'Receptionist']} />,
            children: [
              { path: '/patients', element: <ResourceListPage resource="patients" /> },
              { path: '/invoices', element: <ResourceListPage resource="invoices" /> },
              { path: '/payments', element: <PaymentsPage /> },
            ],
          },
          {
            element: <RoleRoute roles={['Admin', 'Doctor', 'Receptionist']} />,
            children: [
              { path: '/appointments', element: <ResourceListPage resource="appointments" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
