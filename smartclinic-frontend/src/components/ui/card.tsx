import { cn } from '../../utils/cn'

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm shadow-slate-950/5',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[rgb(var(--border))] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
