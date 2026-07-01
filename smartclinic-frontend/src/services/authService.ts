import { apiClient } from '../api/client'
import type { ApiResponse, AuthResult, CurrentUser } from '../types/api'
import type { Role } from '../types/api'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  clinicId: number
  role: Role
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/Auth/login', payload)
    return data.data
  },
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/Auth/register', payload)
    return data.data
  },
  async me() {
    const { data } = await apiClient.get<ApiResponse<CurrentUser>>('/Auth/me')
    return data.data
  },
}
