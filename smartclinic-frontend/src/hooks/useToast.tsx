import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '../utils/cn'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; title: string; description?: string; kind: ToastKind }

const ToastContext = createContext<{
  toast: (toast: Omit<Toast, 'id' | 'kind'> & { kind?: ToastKind }) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (next: Omit<Toast, 'id' | 'kind'> & { kind?: ToastKind }) => {
      const id = Date.now()
      setToasts((current) => [...current, { ...next, id, kind: next.kind ?? 'info' }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((item) => {
          const Icon = item.kind === 'success' ? CheckCircle2 : item.kind === 'error' ? TriangleAlert : Info
          return (
            <div
              key={item.id}
              className={cn(
                'flex gap-3 rounded-lg border bg-[rgb(var(--card))] p-4 text-sm shadow-xl shadow-slate-950/10',
                item.kind === 'success' && 'border-teal-500/30',
                item.kind === 'error' && 'border-red-500/30',
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-[rgb(var(--primary))]" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-[rgb(var(--muted-foreground))]">{item.description}</p>
                ) : null}
              </div>
              <button aria-label="Dismiss notification" onClick={() => dismiss(item.id)}>
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used within ToastProvider')
  return value
}
