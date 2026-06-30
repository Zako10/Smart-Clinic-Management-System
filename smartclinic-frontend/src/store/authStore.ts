import { create } from 'zustand'
import type { AuthResult, CurrentUser } from '../types/api'

const TOKEN_KEY = 'smartclinic.token'
const USER_KEY = 'smartclinic.user'

type AuthState = {
  token: string | null
  user: CurrentUser | null
  hasHydrated: boolean
  setSession: (auth: AuthResult, user?: Partial<CurrentUser>) => void
  setCurrentUser: (user: CurrentUser) => void
  logout: () => void
  hydrate: () => void
}

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hasHydrated: false,
  setSession: (auth, user) => {
    const currentUser: CurrentUser = {
      userId: user?.userId ?? 0,
      clinicId: user?.clinicId ?? 0,
      role: auth.role,
      email: auth.email,
      fullName: auth.fullName,
    }
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
    set({ token: auth.token, user: currentUser, hasHydrated: true })
  },
  setCurrentUser: (user) => {
    const merged = { ...get().user, ...user }
    localStorage.setItem(USER_KEY, JSON.stringify(merged))
    set({ user: merged })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null, hasHydrated: true })
  },
  hydrate: () => {
    set({
      token: localStorage.getItem(TOKEN_KEY),
      user: readJson<CurrentUser>(USER_KEY),
      hasHydrated: true,
    })
  },
}))

export function getAuthToken() {
  return useAuthStore.getState().token ?? localStorage.getItem(TOKEN_KEY)
}
