import { apiClient } from '../api/client'
import type {
  ApiResponse,
  Appointment,
  Clinic,
  Doctor,
  Invoice,
  PaginatedResult,
  PaginationParams,
  Patient,
} from '../types/api'

export const resourceService = {
  async clinics() {
    const { data } = await apiClient.get<ApiResponse<Clinic[]>>('/Clinic')
    return data.data ?? []
  },
  async doctors(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Doctor>>>('/Doctor', {
      params,
    })
    return data.data
  },
  async patients(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Patient>>>('/Patient', {
      params,
    })
    return data.data
  },
  async appointments(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Appointment>>>(
      '/Appointment',
      { params },
    )
    return data.data
  },
  async invoices() {
    const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/Invoice')
    return data.data ?? []
  },
  async create(path: string, payload: unknown) {
    const { data } = await apiClient.post<ApiResponse<unknown>>(path, payload)
    return data
  },
  async update(path: string, id: number, payload: unknown) {
    const { data } = await apiClient.put<ApiResponse<unknown>>(`${path}/${id}`, payload)
    return data
  },
  async remove(path: string, id: number) {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(`${path}/${id}`)
    return data
  },
}
