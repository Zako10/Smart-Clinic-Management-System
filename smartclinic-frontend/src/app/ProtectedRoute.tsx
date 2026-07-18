import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { normalizeRole, type Role } from '../types/api'

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const location = useLocation()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser)

  const me = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: hasHydrated && Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (me.isSuccess) {
      setCurrentUser({ ...me.data, email: user?.email, fullName: user?.fullName })
    }
  }, [me.data, me.isSuccess, setCurrentUser, user?.email, user?.fullName])

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-[rgb(var(--muted-foreground))]">Opening your workspace...</div>
  }
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  const currentRole = normalizeRole(me.data?.role) ?? normalizeRole(user?.role)
  if (!currentRole && me.isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-[rgb(var(--muted-foreground))]">Opening your account...</div>
  }
  if (me.isError && !currentRole) return <Navigate to="/login" replace state={{ from: location }} />
  if (!currentRole) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && currentRole && !roles.includes(currentRole)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}
