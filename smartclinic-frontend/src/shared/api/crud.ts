import { httpClient } from '@/shared/api/http-client'
import {
  normalizePaginatedResult,
  unwrapApiResponse,
  type ApiResponse,
  type PaginatedResult,
  type PaginationRequest,
} from '@/shared/api/types'

export async function getCollection<T>(url: string, params?: PaginationRequest) {
  const { data } = await httpClient.get<ApiResponse<PaginatedResult<T> | T[]>>(url, { params })
  return normalizePaginatedResult(unwrapApiResponse(data))
}

export async function getResource<T>(url: string) {
  const { data } = await httpClient.get<ApiResponse<T>>(url)
  return unwrapApiResponse(data)
}

export async function createResource<TPayload>(url: string, payload: TPayload) {
  const { data } = await httpClient.post<ApiResponse<null>>(url, payload)
  return data
}

export async function updateResource<TPayload>(url: string, payload: TPayload) {
  const { data } = await httpClient.put<ApiResponse<null>>(url, payload)
  return data
}

export async function deleteResource(url: string) {
  const { data } = await httpClient.delete<ApiResponse<null>>(url)
  return data
}
