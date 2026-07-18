import { apiClient, unwrapApiData } from '../api/client'
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

function asPaginated<T>(
  value: (Partial<PaginatedResult<T>> & {
    Items?: T[]
    PageNumber?: number
    PageSize?: number
    TotalCount?: number
    TotalPages?: number
  }) | null | undefined,
  pageNumber: number,
  pageSize: number,
) {
  const items = value?.items ?? value?.Items
  if (!value || !Array.isArray(items)) {
    return {
      items: [],
      pageNumber,
      pageSize,
      totalCount: 0,
      totalPages: 0,
    }
  }

  return {
    items,
    pageNumber: value.pageNumber ?? value.PageNumber ?? pageNumber,
    pageSize: value.pageSize ?? value.PageSize ?? pageSize,
    totalCount: value.totalCount ?? value.TotalCount ?? items.length,
    totalPages:
      value.totalPages ??
      value.TotalPages ??
      Math.ceil((value.totalCount ?? value.TotalCount ?? items.length) / (value.pageSize ?? value.PageSize ?? pageSize)),
  }
}

export const resourceService = {
  async clinics() {
    const { data } = await apiClient.get<ApiResponse<Clinic[]>>('/Clinic')
    return asArray<Clinic>(unwrapApiData(data))
  },
  async doctors(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Doctor>>>('/Doctor', {
      params,
    })
    return asPaginated(unwrapApiData(data), params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async patients(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Patient>>>('/Patient', {
      params,
    })
    return asPaginated(unwrapApiData(data), params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async appointments(params: PaginationParams) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Appointment>>>(
      '/Appointment',
      { params },
    )
    return asPaginated(unwrapApiData(data), params.pageNumber ?? 1, params.pageSize ?? 10)
  },
  async invoices() {
    const { data } = await apiClient.get<ApiResponse<Invoice[]>>('/Invoice')
    return asArray<Invoice>(unwrapApiData(data))
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
