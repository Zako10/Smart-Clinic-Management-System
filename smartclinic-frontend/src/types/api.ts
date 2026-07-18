export type Role = 'Admin' | 'Doctor' | 'Receptionist'

export const roles = ['Admin', 'Doctor', 'Receptionist'] as const

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && roles.includes(value as Role)
}

export function normalizeRole(value: unknown): Role | null {
  if (isRole(value)) return value
  if (typeof value !== 'string') return null
  const match = roles.find((role) => role.toLowerCase() === value.toLowerCase())
  return match ?? null
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export type PaginatedResult<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type CurrentUser = {
  userId: number
  role: Role
  clinicId: number
  email?: string
  fullName?: string
}

export type AuthResult = {
  token: string
  email: string
  fullName: string
  role: Role
}

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
}

export type Clinic = {
  id: number
  name: string
  address: string
  phone: string
  email: string
}

export type Doctor = {
  id: number
  firstName: string
  lastName: string
  specialty: string
  phone: string
  clinicId: number
}

export type Patient = {
  id: number
  fullName: string
  phone: string
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled'
export type AppointmentStatusValue = 0 | 1 | 2

export type Appointment = {
  id: number
  dateTime: string
  patientId: number
  doctorId: number
  clinicId: number
  status: AppointmentStatus
  notes: string
}

export type Invoice = {
  id: number
  appointmentId: number
  totalAmount: number
  status: 'Pending' | 'Partial' | 'Paid' | string
}

export type Payment = {
  id: number
  invoiceId: number
  amount: number
  method?: string
}

export type PaymentMethodValue = 0 | 1

export type PaginationParams = {
  pageNumber?: number
  pageSize?: number
}
