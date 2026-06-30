import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types/api'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser)

  const me = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: Boolean(token),
    retry: false,
  })

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  if (me.isSuccess && (!user?.userId || user.clinicId === undefined)) setCurrentUser({ ...me.data, email: user?.email, fullName: user?.fullName })
  const currentRole = me.data?.role ?? user?.role
  if (roles && currentRole && !roles.includes(currentRole)) return <Navigate to="/forbidden" replace />
  if (roles && !currentRole && me.isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-[rgb(var(--muted-foreground))]">Restoring secure session...</div>
  }
  return <Outlet />
}
