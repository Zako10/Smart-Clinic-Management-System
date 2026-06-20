import type { UserRole } from '@/shared/types/roles'

export type AuthUser = {
  userId: number
  email: string
  fullName: string
  role: UserRole
  clinicId: number
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  clinicId: number
}

export type AuthResultDto = {
  token?: string
  Token?: string
  email?: string
  Email?: string
  fullName?: string
  FullName?: string
  role?: string
  Role?: string
}

export type MeDto = {
  userId?: number
  UserId?: number
  role?: string
  Role?: string
  clinicId?: number
  ClinicId?: number
}
