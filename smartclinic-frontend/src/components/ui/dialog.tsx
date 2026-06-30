import { X } from 'lucide-react'
import { Button } from './button'

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--border))] p-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onCancel}>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Dialog>
  )
}
