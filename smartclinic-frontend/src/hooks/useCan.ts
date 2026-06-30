import type { Role } from '../types/api'
import { useAuthStore } from '../store/authStore'

export function useCan(roles: Role[]) {
  const role = useAuthStore((state) => state.user?.role)
  return Boolean(role && roles.includes(role))
}
