import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/features/auth/types/auth.types'

type AuthState = {
  token: string | null
  user: AuthUser | null
  isBootstrapped: boolean
  setSession: (token: string, user: AuthUser) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
  markBootstrapped: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isBootstrapped: false,
      setSession: (token, user) => set({ token, user, isBootstrapped: true }),
      setUser: (user) => set({ user, isBootstrapped: true }),
      clearSession: () => set({ token: null, user: null, isBootstrapped: true }),
      markBootstrapped: () => set({ isBootstrapped: true }),
    }),
    {
      name: 'smartclinic.auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.markBootstrapped()
      },
    },
  ),
)
