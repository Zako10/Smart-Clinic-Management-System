import { useQueries } from '@tanstack/react-query'
import { Activity, ArrowUpRight, Clock3, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardHeader } from '../components/ui/card'
import { metricCards, resourceConfigs } from '../features/resources/resourceConfig'
import { resourceService } from '../services/resourceService'
import { useAuthStore } from '../store/authStore'
import type { PaginatedResult } from '../types/api'
import { currency, dateTime } from '../utils/format'

function countFromData(data: unknown) {
  if (Array.isArray(data)) return data.length
  if (data && typeof data === 'object' && 'totalCount' in data) {
    return (data as PaginatedResult<unknown>).totalCount
  }
  return 0
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const queries = useQueries({
    queries: [
      { queryKey: ['clinics'], queryFn: resourceService.clinics, retry: false },
      { queryKey: ['doctors', 1], queryFn: () => resourceService.doctors({ pageNumber: 1, pageSize: 5 }), retry: false },
      { queryKey: ['patients', 1], queryFn: () => resourceService.patients({ pageNumber: 1, pageSize: 5 }), retry: false },
      { queryKey: ['appointments', 1], queryFn: () => resourceService.appointments({ pageNumber: 1, pageSize: 5 }), retry: false },
      { queryKey: ['invoices'], queryFn: resourceService.invoices, retry: false },
    ],
  })

  const [clinics, doctors, patients, appointments, invoices] = queries
  const invoiceList = Array.isArray(invoices.data) ? invoices.data : []
  const appointmentList = appointments.data && 'items' in appointments.data ? appointments.data.items : []
  const totalRevenue = invoiceList.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const visibleResources = Object.values(resourceConfigs).filter((config) => user?.role && config.roles.includes(user.role))

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
          <Badge tone="success">Secure session active</Badge>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
            Good day, {user?.fullName ?? user?.role}. Your clinic workspace is ready.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--muted-foreground))]">
            Monitor patient flow, clinical schedules, billing status, and operational records from one role-aware dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {visibleResources.slice(0, 3).map((resource) => (
              <Link key={resource.key} to={`/${resource.key}`}>
                <Button variant="secondary">
                  {resource.title}
                  <ArrowUpRight className="size-4" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Role policy</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{user?.role} access</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">Clinic scope</span>
              <span>#{user?.clinicId ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">Available modules</span>
              <span>{visibleResources.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">Session</span>
              <span>JWT</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          const data = [clinics.data, doctors.data, patients.data, appointments.data, invoices.data][index]
          return (
            <Card key={metric.key} className="p-5">
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-lg bg-[rgb(var(--muted))]">
                  <Icon className="size-4 text-[rgb(var(--muted-foreground))]" />
                </div>
                {queries[index].isError ? <Badge tone="danger">Restricted</Badge> : <Badge tone="neutral">Live</Badge>}
              </div>
              <p className="mt-4 text-2xl font-semibold">{queries[index].isLoading ? '...' : countFromData(data)}</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{metric.label}</p>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card>
          <CardHeader title="Upcoming appointments" description="Latest schedule entries available to your role" />
          <div className="divide-y divide-[rgb(var(--border))]">
            {appointmentList.length === 0 ? (
              <div className="p-6 text-sm text-[rgb(var(--muted-foreground))]">No appointments available.</div>
            ) : (
              appointmentList.map((appointment) => (
                <div key={appointment.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-[rgb(var(--primary)/0.12)]">
                      <Clock3 className="size-4 text-[rgb(var(--primary))]" />
                    </div>
                    <div>
                      <p className="font-medium">Appointment #{appointment.id}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        Patient #{appointment.patientId} with Doctor #{appointment.doctorId}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <Badge tone={appointment.status === 'Completed' ? 'success' : 'warning'}>{appointment.status}</Badge>
                    <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                      {dateTime.format(new Date(appointment.dateTime))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue snapshot" description="Invoice totals from billing records" />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-lg bg-teal-500/10 text-teal-500">
                <Activity className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{currency.format(totalRevenue)}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Total invoiced</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {invoiceList.slice(0, 4).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-md bg-[rgb(var(--muted))] px-3 py-2 text-sm">
                  <span>Invoice #{invoice.id}</span>
                  <span className="font-medium">{currency.format(invoice.totalAmount)}</span>
                </div>
              ))}
              {invoiceList.length === 0 ? <p className="text-sm text-[rgb(var(--muted-foreground))]">No invoices available.</p> : null}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
