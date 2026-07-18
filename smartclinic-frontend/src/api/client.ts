import axios from 'axios'
import { getAuthToken, useAuthStore } from '../store/authStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function getApiMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string
      Message?: string
      errors?: Record<string, string[]>
      Errors?: Record<string, string[]>
    }
    const errors = data?.errors ?? data?.Errors
    if (errors) {
      return Object.values(errors).flat().join(' ')
    }
    const message = data?.message ?? data?.Message
    if (message) return friendlyMessage(message, error.response?.status)
    return friendlyMessage(error.message, error.response?.status)
  }
  return fallback
}

export function unwrapApiData<T>(response: { data?: T; Data?: T }) {
  return response.data ?? response.Data
}

export function unwrapApiMessage(response: { message?: string; Message?: string }) {
  return response.message ?? response.Message ?? 'Done'
}

function friendlyMessage(message: string, status?: number) {
  const normalized = message.toLowerCase()
  if (normalized.includes('email already registered')) {
    return 'This email is already used. Sign in or try another email.'
  }
  if (normalized.includes('no clinic is ready')) {
    return 'No clinic is ready yet. Please use clinic number 1 or ask the manager.'
  }
  if (normalized.includes('authentication is required')) {
    return 'Please sign in again.'
  }
  if (normalized.includes('not allowed') || status === 403) {
    return 'This page is not available for your account.'
  }
  if (status === 409) {
    return message || 'This item already exists or cannot be saved this way.'
  }
  if (status === 400) {
    return message || 'Please check what you entered and try again.'
  }
  if (status && status >= 500) {
    return 'Something went wrong. Please try again.'
  }
  return message
}
