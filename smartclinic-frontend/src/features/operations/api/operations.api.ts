import { getCollection } from '@/shared/api/crud'
import type { PaginationRequest } from '@/shared/api/types'
import type {
  Appointment,
  Clinic,
  Doctor,
  Invoice,
  Patient,
} from '@/features/operations/types/operations.types'

export const operationsApi = {
  clinics: (params?: PaginationRequest) => {
    void params
    return getCollection<Clinic>('/clinic')
  },
  doctors: (params?: PaginationRequest) => getCollection<Doctor>('/doctor', params),
  patients: (params?: PaginationRequest) => getCollection<Patient>('/patient', params),
  appointments: (params?: PaginationRequest) => getCollection<Appointment>('/appointment', params),
  invoices: (params?: PaginationRequest) => {
    void params
    return getCollection<Invoice>('/invoice')
  },
}
