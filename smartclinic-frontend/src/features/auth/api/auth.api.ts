import { httpClient } from '@/shared/api/http-client'
import { unwrapApiResponse, type ApiResponse } from '@/shared/api/types'
import { isUserRole } from '@/shared/types/roles'
import type {
  AuthResultDto,
  AuthUser,
  LoginRequest,
  MeDto,
  RegisterRequest,
} from '@/features/auth/types/auth.types'

function normalizeAuthResult(dto: AuthResultDto) {
  const token = dto.token ?? dto.Token
  const email = dto.email ?? dto.Email
  const fullName = dto.fullName ?? dto.FullName
  const role = dto.role ?? dto.Role

  if (!token || !email || !fullName || !isUserRole(role)) {
    throw new Error('Authentication response is malformed')
  }

  return { token, email, fullName, role }
}

function normalizeMe(dto: MeDto) {
  const userId = dto.userId ?? dto.UserId
  const clinicId = dto.clinicId ?? dto.ClinicId
  const role = dto.role ?? dto.Role

  if (!userId || !clinicId || !isUserRole(role)) {
    throw new Error('Current user response is malformed')
  }

  return { userId, clinicId, role }
}

export async function login(payload: LoginRequest) {
  const { data } = await httpClient.post<ApiResponse<AuthResultDto>>('/auth/login', payload)
  return normalizeAuthResult(unwrapApiResponse(data))
}

export async function register(payload: RegisterRequest) {
  const { data } = await httpClient.post<ApiResponse<AuthResultDto>>('/auth/register', payload)
  return normalizeAuthResult(unwrapApiResponse(data))
}

export async function getCurrentUser(baseUser: Pick<AuthUser, 'email' | 'fullName'>): Promise<AuthUser> {
  const { data } = await httpClient.get<ApiResponse<MeDto>>('/auth/me')
  const me = normalizeMe(unwrapApiResponse(data))

  return {
    ...baseUser,
    ...me,
  }
}
