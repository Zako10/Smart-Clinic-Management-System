import { create } from 'zustand'
import { normalizeRole } from '../types/api'
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

function normalizeUser(user: Partial<CurrentUser> | null): CurrentUser | null {
  const role = normalizeRole(user?.role)
  if (!role) return null
  return {
    userId: Number(user?.userId ?? 0),
    clinicId: Number(user?.clinicId ?? 0),
    role,
    email: user?.email,
    fullName: user?.fullName,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hasHydrated: false,
  setSession: (auth, user) => {
    const role = normalizeRole(auth.role)
    if (!auth.token || !role) {
      throw new Error('The server returned an invalid sign-in response.')
    }
    const currentUser: CurrentUser = {
      userId: user?.userId ?? 0,
      clinicId: user?.clinicId ?? 0,
      role,
      email: auth.email,
      fullName: auth.fullName,
    }
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
    set({ token: auth.token, user: currentUser, hasHydrated: true })
  },
  setCurrentUser: (user) => {
    const previous = get().user
    const role = normalizeRole(user.role) ?? previous?.role
    if (!role) return
    const merged: CurrentUser = {
      userId: user.userId ?? previous?.userId ?? 0,
      clinicId: user.clinicId ?? previous?.clinicId ?? 0,
      role,
      email: user.email ?? previous?.email,
      fullName: user.fullName ?? previous?.fullName,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(merged))
    set({ user: merged })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null, hasHydrated: true })
  },
  hydrate: () => {
    const user = normalizeUser(readJson<CurrentUser>(USER_KEY))
    set({
      token: localStorage.getItem(TOKEN_KEY),
      user,
      hasHydrated: true,
    })
  },
}))

export function getAuthToken() {
  return useAuthStore.getState().token ?? localStorage.getItem(TOKEN_KEY)
}
