import { apiClient } from '../api/client'
import { normalizeRole } from '../types/api'
import type { ApiResponse, AuthResult, CurrentUser, LoginPayload, RegisterPayload } from '../types/api'

function normalizeAuthResult(value: AuthResult) {
  const role = normalizeRole(value?.role)
  if (!value?.token || !role) {
    throw new Error('The server returned an invalid authentication response.')
  }
  return { ...value, role }
}

function normalizeCurrentUser(value: CurrentUser) {
  const role = normalizeRole(value?.role)
  if (!role) {
    throw new Error('The server returned an invalid user profile response.')
  }
  return { ...value, role }
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/Auth/login', payload)
    return normalizeAuthResult(data.data)
  },
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/Auth/register', payload)
    return normalizeAuthResult(data.data)
  },
  async me() {
    const { data } = await apiClient.get<ApiResponse<CurrentUser>>('/Auth/me')
    return normalizeCurrentUser(data.data)
  },
}
