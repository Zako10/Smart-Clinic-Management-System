import { Outlet } from 'react-router-dom'
import { Activity, ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>

      <aside className="hidden border-l bg-card lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart Clinic</p>
              <p className="text-xs text-muted-foreground">Clinical operations platform</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Secure clinic workspace
            </div>
            <h1 className="text-4xl font-semibold tracking-normal">
              Manage patients, appointments, billing, and care teams from one operational cockpit.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Built for reception teams, doctors, and administrators who need fast patient flow,
              clear accountability, and reliable billing visibility.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="mt-1 text-xs text-muted-foreground">Clinic access</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-2xl font-semibold">RBAC</p>
              <p className="mt-1 text-xs text-muted-foreground">Role policies</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-2xl font-semibold">JWT</p>
              <p className="mt-1 text-xs text-muted-foreground">Secure sessions</p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}
