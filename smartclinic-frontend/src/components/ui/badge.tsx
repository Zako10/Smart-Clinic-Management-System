import { cn } from '../../utils/cn'

const toneClass = {
  neutral: 'border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]',
  success: 'border-teal-500/25 bg-teal-500/10 text-teal-600 dark:text-teal-300',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300',
  info: 'border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof toneClass
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
