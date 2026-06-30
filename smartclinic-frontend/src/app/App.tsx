import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '../hooks/useToast'
import { LoginPage, RegisterPage } from '../features/auth/AuthPages'
import { ResourcePage } from '../features/resources/ResourcePage'
import { resourceConfigs } from '../features/resources/resourceConfig'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ForbiddenPage, NotFoundPage } from '../pages/ErrorPages'
import { useAuthStore } from '../store/authStore'
import type { Appointment, Clinic, Doctor, Invoice, Patient } from '../types/api'
import { ProtectedRoute } from './ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

const typedPages = {
  clinics: <ResourcePage<Clinic> config={resourceConfigs.clinics} />,
  doctors: <ResourcePage<Doctor> config={resourceConfigs.doctors} />,
  patients: <ResourcePage<Patient> config={resourceConfigs.patients} />,
  appointments: <ResourcePage<Appointment> config={resourceConfigs.appointments} />,
  invoices: <ResourcePage<Invoice> config={resourceConfigs.invoices} />,
  payments: <ResourcePage<Invoice> config={resourceConfigs.payments} />,
}

export function App() {
  const hydrate = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                {Object.values(resourceConfigs).map((config) => (
                  <Route
                    key={config.key}
                    element={<ProtectedRoute roles={config.roles} />}
                  >
                    <Route path={`/${config.key}`} element={typedPages[config.key]} />
                  </Route>
                ))}
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
