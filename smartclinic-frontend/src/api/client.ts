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

function friendlyMessage(message: string, status?: number) {
  const normalized = message.toLowerCase()
  if (normalized.includes('email already registered')) {
    return 'This email is already registered. Please sign in or use a different email.'
  }
  if (normalized.includes('no clinic is ready')) {
    return 'No clinic is available yet. Ask an admin to create a clinic first.'
  }
  if (normalized.includes('authentication is required')) {
    return 'Your session expired. Please sign in again.'
  }
  if (normalized.includes('not allowed') || status === 403) {
    return 'You do not have permission to perform this action.'
  }
  if (status === 409) {
    return message || 'This record conflicts with existing data.'
  }
  if (status === 400) {
    return message || 'Please check the form and try again.'
  }
  if (status && status >= 500) {
    return 'The server could not complete the request. Please try again.'
  }
  return message
}
