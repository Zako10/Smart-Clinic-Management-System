export type Clinic = {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
}

export type Doctor = {
  id: number
  firstName: string
  lastName: string
  specialty: string
  phone?: string
  clinicId: number
}

export type Patient = {
  id: number
  fullName?: string
  firstName?: string
  lastName?: string
  phone?: string
  clinicId: number
}

export type Appointment = {
  id: number
  patientId: number
  doctorId: number
  clinicId: number
  dateTime: string
  status: string
  notes?: string
}

export type Invoice = {
  id: number
  appointmentId: number
  totalAmount: number
  issueDate: string
  status: string
  clinicId: number
}

export type Payment = {
  id: number
  invoiceId: number
  amount: number
  paymentDate: string
  method: string
  status: string
}
