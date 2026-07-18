import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { getApiMessage } from '../../api/client'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardHeader } from '../../components/ui/card'
import { EmptyState, ErrorState, SkeletonRows } from '../../components/ui/data-state'
import { ConfirmDialog, Dialog } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { useCan } from '../../hooks/useCan'
import { useToast } from '../../hooks/useToast'
import { resourceService } from '../../services/resourceService'
import type { PaginatedResult } from '../../types/api'
import type { ResourceConfig } from './resourceConfig'
import { ResourceForm } from './ResourceForm'

type Identifiable = { id: number }
type ResourceData<T> = T[] | PaginatedResult<T>

function isPaginated<T>(value: T[] | PaginatedResult<T>): value is PaginatedResult<T> {
  return Boolean(value && !Array.isArray(value) && 'items' in value)
}

export function ResourcePage<T extends Identifiable>({ config }: { config: ResourceConfig<T> }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<T | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)
  const canCreate = useCan(config.createRoles)
  const canUpdate = useCan(config.updateRoles)
  const canDelete = useCan(config.deleteRoles)
  const canRecordPayment = config.key === 'payments' && canCreate

  const query = useQuery<ResourceData<T>>({
    queryKey: [config.query, page],
    queryFn: async () => {
      if (config.query === 'clinics') return (await resourceService.clinics()) as unknown as ResourceData<T>
      if (config.query === 'doctors') return (await resourceService.doctors({ pageNumber: page, pageSize: 10 })) as unknown as ResourceData<T>
      if (config.query === 'patients') return (await resourceService.patients({ pageNumber: page, pageSize: 10 })) as unknown as ResourceData<T>
      if (config.query === 'appointments') return (await resourceService.appointments({ pageNumber: page, pageSize: 10 })) as unknown as ResourceData<T>
      return (await resourceService.invoices()) as unknown as ResourceData<T>
    },
    placeholderData: keepPreviousData,
  })

  const mutation = useMutation({
    mutationFn: (values: Record<string, string | number>) => {
      const payload = config.toPayload(values)
      if (editing && config.key !== 'payments') {
        return resourceService.update(config.endpoint, editing.id, payload)
      }
      return resourceService.create(config.endpoint, payload)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [config.query] })
      setIsFormOpen(false)
      setEditing(null)
      toast({ kind: 'success', title: 'Saved', description: response.message })
    },
    onError: (error) => {
      toast({ kind: 'error', title: 'Request failed', description: getApiMessage(error) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (item: T) => resourceService.remove(config.endpoint, item.id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [config.query] })
      setDeleting(null)
      toast({ kind: 'success', title: 'Deleted', description: response.message })
    },
    onError: (error) => {
      toast({ kind: 'error', title: 'Delete failed', description: getApiMessage(error) })
    },
  })

  const filtered = useMemo(() => {
    const rawItems = query.data ? (isPaginated(query.data) ? query.data.items : query.data) : []
    const term = search.trim().toLowerCase()
    if (!term) return rawItems as T[]
    return (rawItems as T[]).filter((item) => config.searchable(item).toLowerCase().includes(term))
  }, [config, query.data, search])
  const pageInfo = query.data && isPaginated(query.data) ? query.data : null
  const Icon = config.icon

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]">
              <Icon className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{config.description}</p>
            </div>
          </div>
        </div>
        {canCreate ? (
          <Button
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add {config.singular}
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader
          title="List"
          description={`${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} shown`}
          action={
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search here..."
                className="pl-9"
              />
            </div>
          }
        />

        {query.isLoading ? <SkeletonRows /> : null}
        {query.isError ? <ErrorState message={getApiMessage(query.error)} onRetry={() => query.refetch()} /> : null}
        {!query.isLoading && !query.isError && filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Add a new item or change your search to see results."
            action={
              canCreate ? (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="size-4" />
                  Add first item
                </Button>
              ) : null
            }
          />
        ) : null}
        {!query.isLoading && !query.isError && filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[rgb(var(--muted))] text-xs uppercase text-[rgb(var(--muted-foreground))]">
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.label} className="px-4 py-3 font-semibold">
                      {column.label}
                    </th>
                  ))}
                  {(canUpdate || canDelete || canRecordPayment) && (
                    <th className="px-4 py-3 text-right font-semibold">Options</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-[rgb(var(--muted)/0.45)]">
                    {config.columns.map((column) => (
                      <td key={column.label} className="max-w-[18rem] px-4 py-3">
                        {column.render(item)}
                      </td>
                    ))}
                    {(canUpdate || canDelete || canRecordPayment) && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {canRecordPayment ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={(item as { status?: string }).status === 'Paid'}
                              onClick={() => {
                                setEditing(item)
                                setIsFormOpen(true)
                              }}
                            >
                              <CreditCard className="size-4" />
                              Record
                            </Button>
                          ) : null}
                          {canUpdate && config.key !== 'payments' ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              aria-label="Edit"
                              onClick={() => {
                                setEditing(item)
                                setIsFormOpen(true)
                              }}
                            >
                              <Edit3 className="size-4" />
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => setDeleting(item)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {pageInfo ? (
          <div className="flex flex-col gap-3 border-t border-[rgb(var(--border))] p-4 sm:flex-row sm:items-center sm:justify-between">
            <Badge>
              Page {pageInfo.pageNumber} of {Math.max(pageInfo.totalPages, 1)}
            </Badge>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= pageInfo.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Dialog
        open={isFormOpen}
        title={editing && config.key !== 'payments' ? `Edit ${config.singular}` : `New ${config.singular}`}
        description={
          config.key === 'payments'
            ? 'Choose an invoice, amount, and method to record a payment.'
            : 'Fill in the details below, then save.'
        }
        onClose={() => setIsFormOpen(false)}
      >
        <ResourceForm
          config={config}
          item={editing}
          pending={mutation.isPending}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove item"
        description="Confirm this action before continuing."
        pending={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </div>
  )
}
