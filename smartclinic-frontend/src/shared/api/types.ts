export type ApiResponse<T> = {
  success?: boolean
  Success?: boolean
  message?: string
  Message?: string
  data?: T
  Data?: T
  errors?: Record<string, string[]>
  Errors?: Record<string, string[]>
}

export type PaginatedResult<T> = {
  items?: T[]
  Items?: T[]
  pageNumber?: number
  PageNumber?: number
  pageSize?: number
  PageSize?: number
  totalCount?: number
  TotalCount?: number
}

export type PaginationRequest = {
  pageNumber?: number
  pageSize?: number
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return (response.data ?? response.Data) as T
}

export function getApiMessage(response: ApiResponse<unknown>) {
  return response.message ?? response.Message ?? 'Request failed'
}

export function normalizePaginatedResult<T>(result: PaginatedResult<T> | T[]) {
  if (Array.isArray(result)) {
    return {
      items: result,
      pageNumber: 1,
      pageSize: result.length,
      totalCount: result.length,
    }
  }

  return {
    items: result.items ?? result.Items ?? [],
    pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
    pageSize: result.pageSize ?? result.PageSize ?? 10,
    totalCount: result.totalCount ?? result.TotalCount ?? 0,
  }
}
