import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from './button'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-[rgb(var(--muted))]">
        <Inbox className="size-5 text-[rgb(var(--muted-foreground))]" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <AlertCircle className="size-8 text-red-500" />
      <h3 className="mt-4 font-semibold">Unable to load data</h3>
      <p className="mt-1 max-w-md text-sm text-[rgb(var(--muted-foreground))]">{message}</p>
      {onRetry ? (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[rgb(var(--border))]">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 p-4">
          <div className="h-4 rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 rounded bg-[rgb(var(--muted))]" />
        </div>
      ))}
    </div>
  )
}
