import {
  Banknote,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  Stethoscope,
  UsersRound,
} from 'lucide-react'
import { z } from 'zod'
import type { Appointment, Clinic, Doctor, Invoice, Patient, Role } from '../../types/api'
import { currency, formatDateTime } from '../../utils/format'
import { Badge } from '../../components/ui/badge'

export type ResourceKey =
  | 'clinics'
  | 'doctors'
  | 'patients'
  | 'appointments'
  | 'invoices'
  | 'payments'

export type FieldConfig = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'datetime-local' | 'textarea' | 'select'
  options?: { label: string; value: string | number }[]
  hideOnCreate?: boolean
}

export type ResourceConfig<T> = {
  key: ResourceKey
  title: string
  singular: string
  description: string
  endpoint: string
  icon: React.ElementType
  roles: Role[]
  createRoles: Role[]
  updateRoles: Role[]
  deleteRoles: Role[]
  query: 'clinics' | 'doctors' | 'patients' | 'appointments' | 'invoices'
  paginated: boolean
  searchable: (item: T) => string
  columns: { label: string; render: (item: T) => React.ReactNode }[]
  schema: z.ZodTypeAny
  fields: FieldConfig[]
  defaults: Record<string, string | number>
  toPayload: (values: Record<string, string | number>) => Record<string, unknown>
}

const requiredText = z.string().min(1, 'Required')
const positiveNumber = z.coerce.number().int().min(1, 'Must be greater than zero')
const amount = z.coerce.number().min(0.01, 'Must be greater than zero')
const text = (value: unknown) => (value == null || value === '' ? '-' : String(value))

export const resourceConfigs: Record<ResourceKey, ResourceConfig<any>> = {
  clinics: {
    key: 'clinics',
    title: 'Clinics',
    singular: 'clinic',
    description: 'Add and update clinic branches and contact details.',
    endpoint: '/Clinic',
    icon: Building2,
    roles: ['Admin'],
    createRoles: ['Admin'],
    updateRoles: ['Admin'],
    deleteRoles: ['Admin'],
    query: 'clinics',
    paginated: false,
    searchable: (clinic: Clinic) => `${text(clinic.name)} ${text(clinic.email)} ${text(clinic.phone)} ${text(clinic.address)}`,
    columns: [
      { label: 'Clinic', render: (clinic: Clinic) => <span className="font-medium">{text(clinic.name)}</span> },
      { label: 'Email', render: (clinic: Clinic) => text(clinic.email) },
      { label: 'Phone', render: (clinic: Clinic) => text(clinic.phone) },
      { label: 'Address', render: (clinic: Clinic) => text(clinic.address) },
    ],
    schema: z.object({
      name: requiredText.max(100),
      address: z.string().max(250).optional().or(z.literal('')),
      phone: z.string().max(20).optional().or(z.literal('')),
      email: z.string().email('Invalid email').optional().or(z.literal('')),
    }),
    fields: [
      { name: 'name', label: 'Clinic name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'address', label: 'Address', type: 'textarea' },
    ],
    defaults: { name: '', email: '', phone: '', address: '' },
    toPayload: (values) => values,
  },
  doctors: {
    key: 'doctors',
    title: 'Doctors',
    singular: 'doctor',
    description: 'See doctors, specialties, and clinic contact numbers.',
    endpoint: '/Doctor',
    icon: Stethoscope,
    roles: ['Admin', 'Doctor'],
    createRoles: ['Admin'],
    updateRoles: ['Admin'],
    deleteRoles: ['Admin'],
    query: 'doctors',
    paginated: true,
    searchable: (doctor: Doctor) =>
      `${text(doctor.firstName)} ${text(doctor.lastName)} ${text(doctor.specialty)} ${text(doctor.phone)} ${doctor.clinicId}`,
    columns: [
      {
        label: 'Doctor',
        render: (doctor: Doctor) => (
          <span className="font-medium">Dr. {text(doctor.firstName)} {text(doctor.lastName)}</span>
        ),
      },
      { label: 'Specialty', render: (doctor: Doctor) => <Badge tone="info">{text(doctor.specialty)}</Badge> },
      { label: 'Phone', render: (doctor: Doctor) => text(doctor.phone) },
      { label: 'Clinic', render: (doctor: Doctor) => `#${doctor.clinicId}` },
    ],
    schema: z.object({
      firstName: requiredText.max(100),
      lastName: requiredText.max(100),
      specialty: requiredText.max(100),
      phone: requiredText.max(20),
      clinicId: positiveNumber,
    }),
    fields: [
      { name: 'firstName', label: 'First name' },
      { name: 'lastName', label: 'Last name' },
      { name: 'specialty', label: 'Specialty' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'clinicId', label: 'Clinic number', type: 'number' },
    ],
    defaults: { firstName: '', lastName: '', specialty: '', phone: '', clinicId: 1 },
    toPayload: (values) => ({ ...values, clinicId: Number(values.clinicId) }),
  },
  patients: {
    key: 'patients',
    title: 'Patients',
    singular: 'patient',
    description: 'Add patients and keep their contact details ready.',
    endpoint: '/Patient',
    icon: UsersRound,
    roles: ['Admin', 'Receptionist'],
    createRoles: ['Admin', 'Receptionist'],
    updateRoles: ['Admin', 'Receptionist'],
    deleteRoles: ['Admin'],
    query: 'patients',
    paginated: true,
    searchable: (patient: Patient) => `${text(patient.fullName)} ${text(patient.phone)}`,
    columns: [
      { label: 'Patient', render: (patient: Patient) => <span className="font-medium">{text(patient.fullName)}</span> },
      { label: 'Phone', render: (patient: Patient) => text(patient.phone) },
      { label: 'Patient number', render: (patient: Patient) => `#${patient.id}` },
    ],
    schema: z.object({
      firstName: requiredText.max(100),
      lastName: requiredText.max(100),
      phone: requiredText.max(20),
      clinicId: positiveNumber,
    }),
    fields: [
      { name: 'firstName', label: 'First name' },
      { name: 'lastName', label: 'Last name' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'clinicId', label: 'Clinic number', type: 'number' },
    ],
    defaults: { firstName: '', lastName: '', phone: '', clinicId: 1 },
    toPayload: (values) => ({ ...values, clinicId: Number(values.clinicId) }),
  },
  appointments: {
    key: 'appointments',
    title: 'Appointments',
    singular: 'appointment',
    description: 'Plan patient appointments and follow their current status.',
    endpoint: '/Appointment',
    icon: CalendarClock,
    roles: ['Admin', 'Doctor', 'Receptionist'],
    createRoles: ['Admin', 'Receptionist'],
    updateRoles: ['Admin', 'Doctor'],
    deleteRoles: ['Admin'],
    query: 'appointments',
    paginated: true,
    searchable: (appointment: Appointment) =>
      `${appointment.patientId} ${appointment.doctorId} ${text(appointment.status)} ${text(appointment.notes)}`,
    columns: [
      { label: 'Date', render: (appointment: Appointment) => formatDateTime(appointment.dateTime) },
      { label: 'Patient', render: (appointment: Appointment) => `#${appointment.patientId}` },
      { label: 'Doctor', render: (appointment: Appointment) => `#${appointment.doctorId}` },
      {
        label: 'Status',
        render: (appointment: Appointment) => (
          <Badge
            tone={
              appointment.status === 'Completed'
                ? 'success'
                : appointment.status === 'Cancelled'
                  ? 'danger'
                  : 'warning'
            }
          >
            {text(appointment.status)}
          </Badge>
        ),
      },
      { label: 'Notes', render: (appointment: Appointment) => text(appointment.notes) },
    ],
    schema: z.object({
      dateTime: requiredText,
      patientId: positiveNumber,
      doctorId: positiveNumber,
      clinicId: positiveNumber,
      status: z.coerce.number().int().min(0).max(2),
      notes: z.string().max(250).optional().or(z.literal('')),
    }),
    fields: [
      { name: 'dateTime', label: 'Date and time', type: 'datetime-local' },
      { name: 'patientId', label: 'Patient number', type: 'number' },
      { name: 'doctorId', label: 'Doctor number', type: 'number' },
      { name: 'clinicId', label: 'Clinic number', type: 'number' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        hideOnCreate: true,
        options: [
          { label: 'Scheduled', value: 0 },
          { label: 'Completed', value: 1 },
          { label: 'Cancelled', value: 2 },
        ],
      },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    defaults: { dateTime: '', patientId: 1, doctorId: 1, clinicId: 1, status: 0, notes: '' },
    toPayload: (values) => ({
      ...values,
      patientId: Number(values.patientId),
      doctorId: Number(values.doctorId),
      clinicId: Number(values.clinicId),
      status: Number(values.status),
    }),
  },
  invoices: {
    key: 'invoices',
    title: 'Invoices',
    singular: 'invoice',
    description: 'Track clinic invoices, amounts, and payment status.',
    endpoint: '/Invoice',
    icon: FileText,
    roles: ['Admin', 'Receptionist'],
    createRoles: ['Admin', 'Receptionist'],
    updateRoles: ['Admin', 'Receptionist'],
    deleteRoles: ['Admin'],
    query: 'invoices',
    paginated: false,
    searchable: (invoice: Invoice) => `${invoice.appointmentId} ${invoice.totalAmount} ${text(invoice.status)}`,
    columns: [
      { label: 'Bill', render: (invoice: Invoice) => <span className="font-medium">#{invoice.id}</span> },
      { label: 'Visit', render: (invoice: Invoice) => `#${invoice.appointmentId}` },
      { label: 'Amount', render: (invoice: Invoice) => currency.format(invoice.totalAmount) },
      {
        label: 'Status',
        render: (invoice: Invoice) => (
          <Badge tone={invoice.status === 'Paid' ? 'success' : invoice.status === 'Partial' ? 'warning' : 'neutral'}>
            {text(invoice.status)}
          </Badge>
        ),
      },
    ],
    schema: z.object({ appointmentId: positiveNumber, totalAmount: amount }),
    fields: [
      { name: 'appointmentId', label: 'Visit number', type: 'number' },
      { name: 'totalAmount', label: 'Total amount', type: 'number' },
    ],
    defaults: { appointmentId: 1, totalAmount: 100 },
    toPayload: (values) => ({
      appointmentId: Number(values.appointmentId),
      totalAmount: Number(values.totalAmount),
    }),
  },
  payments: {
    key: 'payments',
    title: 'Payments',
    singular: 'payment',
    description: 'Record money paid against clinic invoices.',
    endpoint: '/Payment',
    icon: CreditCard,
    roles: ['Admin', 'Receptionist'],
    createRoles: ['Admin', 'Receptionist'],
    updateRoles: [],
    deleteRoles: [],
    query: 'invoices',
    paginated: false,
    searchable: (invoice: Invoice) => `${invoice.id} ${text(invoice.status)} ${invoice.totalAmount}`,
    columns: [
      { label: 'Invoice', render: (invoice: Invoice) => <span className="font-medium">#{invoice.id}</span> },
      { label: 'Invoice amount', render: (invoice: Invoice) => currency.format(invoice.totalAmount) },
      {
        label: 'Status',
        render: (invoice: Invoice) => (
          <Badge tone={invoice.status === 'Paid' ? 'success' : invoice.status === 'Partial' ? 'warning' : 'neutral'}>
            {text(invoice.status)}
          </Badge>
        ),
      },
      {
        label: 'Next step',
        render: (invoice: Invoice) => (
          <span className="text-[rgb(var(--muted-foreground))]">
            {invoice.status === 'Paid' ? 'Fully paid' : 'Ready to record'}
          </span>
        ),
      },
    ],
    schema: z.object({
      invoiceId: positiveNumber,
      amount,
      method: z.coerce.number().int().min(0).max(1),
    }),
    fields: [
      { name: 'invoiceId', label: 'Invoice number', type: 'number' },
      { name: 'amount', label: 'Amount', type: 'number' },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        options: [
          { label: 'Cash', value: 0 },
          { label: 'Card', value: 1 },
        ],
      },
    ],
    defaults: { invoiceId: 1, amount: 100, method: 0 },
    toPayload: (values) => ({
      invoiceId: Number(values.invoiceId),
      amount: Number(values.amount),
      method: Number(values.method),
    }),
  },
}

export const metricCards = [
  { key: 'clinics', label: 'Clinics', icon: Building2 },
  { key: 'doctors', label: 'Doctors', icon: Stethoscope },
  { key: 'patients', label: 'Patients', icon: UsersRound },
  { key: 'appointments', label: 'Appointments', icon: CalendarClock },
  { key: 'invoices', label: 'Invoices', icon: Banknote },
] as const
