import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, login, register } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types'

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const clearSession = useAuthStore((state) => state.clearSession)

  const query = useQuery({
    queryKey: ['auth', 'me'],
    enabled: Boolean(token && user?.email && user?.fullName),
    queryFn: () => getCurrentUser({ email: user!.email, fullName: user!.fullName }),
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  useEffect(() => {
    if (query.isError) {
      clearSession()
    }
  }, [query.isError, clearSession])

  return query
}

export function useLogin() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const auth = await login(payload)
      const user = await getCurrentUser({ email: auth.email, fullName: auth.fullName })
      return { token: auth.token, user }
    },
    onSuccess: ({ token, user }) => {
      setSession(token, user)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const auth = await register(payload)
      const user = await getCurrentUser({ email: auth.email, fullName: auth.fullName })
      return { token: auth.token, user }
    },
    onSuccess: ({ token, user }) => {
      setSession(token, user)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  return () => {
    clearSession()
    navigate('/login', { replace: true })
  }
}
