import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { UserRole } from '@/shared/types/roles'
import { LoadingState } from '@/shared/ui/data-state'

export function GuestRoute() {
  const token = useAuthStore((state) => state.token)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped)
  const currentUser = useCurrentUser()

  if (!isBootstrapped) {
    return <LoadingState label="Restoring session" />
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (currentUser.isLoading && user) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState label="Refreshing session" />
      </div>
    )
  }

  return <Outlet />
}

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const user = useAuthStore((state) => state.user)

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
