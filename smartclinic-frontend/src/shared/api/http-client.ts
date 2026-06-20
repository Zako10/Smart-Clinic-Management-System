import axios, { AxiosError } from 'axios'
import { env } from '@/app/config/env'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { getApiMessage, type ApiResponse } from '@/shared/api/types'

export class ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const payload = error.response?.data
    const errors = payload?.errors ?? payload?.Errors

    if (status === 401) {
      useAuthStore.getState().clearSession()
    }

    return Promise.reject(
      new ApiError(payload ? getApiMessage(payload) : 'Network request failed', status, errors),
    )
  },
)
