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

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asPaginated<T>(value: PaginatedResult<T> | null | undefined, pageNumber: number, pageSize: number) {
  if (!value || !Array.isArray(value.items)) {
    return {
      items: [],
      pageNumber,
      pageSize,
      totalCount: 0,
      totalPages: 0,
    }
  }

  return {
    ...value,
    pageNumber: value.pageNumber || pageNumber,
    pageSize: value.pageSize || pageSize,
    totalCount: value.totalCount ?? value.items.length,
    totalPages: value.totalPages ?? Math.ceil((value.totalCount ?? value.items.length) / (value.pageSize || pageSize)),
  }
}

export const resourceService = {
  async clinics() {
    const { data } = await apiClient.get<ApiResponse<Clinic[]>>('/Clinic')
    return asArray<Clinic>(data.data)
  },
  async doctors(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Doctor>>>('/Doctor', {
      params,
    })
    return asPaginated(data.data, params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async patients(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Patient>>>('/Patient', {
      params,
    })
    return asPaginated(data.data, params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async appointments(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Appointment>>>(
      '/Appointment',
      { params },
    )
    return asPaginated(data.data, params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async invoices() {
    const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/Invoice')
    return asArray<Invoice>(data.data)
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
