import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { operationsApi } from '@/features/operations/api/operations.api'
import type { PaginationRequest } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState, LoadingState } from '@/shared/ui/data-state'

type ResourceKind = 'clinics' | 'doctors' | 'patients' | 'appointments' | 'invoices'
type OperationalRecord = Record<string, unknown> & { id: number }

const titles: Record<ResourceKind, { title: string; description: string }> = {
  clinics: {
    title: 'Clinics',
    description: 'Manage clinic branches and operational ownership.',
  },
  doctors: {
    title: 'Doctors',
    description: 'Track medical staff, specialties, and clinic assignments.',
  },
  patients: {
    title: 'Patients',
    description: 'Maintain patient records used by appointments and billing.',
  },
  appointments: {
    title: 'Appointments',
    description: 'Coordinate patient visits and clinical schedules.',
  },
  invoices: {
    title: 'Invoices',
    description: 'Monitor pending, partial, and paid appointment invoices.',
  },
}

export function ResourceListPage({ resource }: { resource: ResourceKind }) {
  const meta = titles[resource]
  const query = useQuery({
    queryKey: ['operations', resource],
    queryFn: () => fetchResource(resource, { pageNumber: 1, pageSize: 10 }),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{meta.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button>
          <Plus />
          New {meta.title.slice(0, -1)}
        </Button>
      </div>

      {query.isLoading ? <LoadingState label={`Loading ${meta.title.toLowerCase()}`} /> : null}

      {query.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            Could not load {meta.title.toLowerCase()}.
          </CardContent>
        </Card>
      ) : null}

      {query.data && query.data.items.length === 0 ? (
        <EmptyState
          title={`No ${meta.title.toLowerCase()} found`}
          description="Create a record or adjust your backend seed data."
        />
      ) : null}

      {query.data && query.data.items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{meta.title} directory</CardTitle>
            <CardDescription>
              Showing {query.data.items.length} of {query.data.totalCount || query.data.items.length} records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Primary</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((item) => (
                    <tr key={String(item.id)} className="border-t">
                      <td className="px-4 py-3 font-medium">{String(item.id)}</td>
                      <td className="px-4 py-3">{getPrimaryText(item)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {getStatusText(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

async function fetchResource(resource: ResourceKind, params: PaginationRequest) {
  const data = await operationsApi[resource](params)

  return {
    ...data,
    items: data.items as OperationalRecord[],
  }
}

function getPrimaryText(item: Record<string, unknown>) {
  if (typeof item.name === 'string') return item.name
  if (typeof item.fullName === 'string') return item.fullName
  if (typeof item.firstName === 'string' || typeof item.lastName === 'string') {
    return `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
  }
  if (typeof item.appointmentId === 'number') return `Appointment #${item.appointmentId}`
  if (typeof item.dateTime === 'string') return new Date(item.dateTime).toLocaleString()
  return 'Record'
}

function getStatusText(item: Record<string, unknown>) {
  if (typeof item.status === 'string') return item.status
  if (typeof item.specialty === 'string') return item.specialty
  if (typeof item.email === 'string') return item.email
  if (typeof item.phone === 'string') return item.phone
  return 'Active'
}
