export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : dateTime.format(date)
}

export function initials(value?: string) {
  return (value ?? 'SC')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
