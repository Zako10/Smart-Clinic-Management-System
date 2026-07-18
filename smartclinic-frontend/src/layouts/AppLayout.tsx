import { useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ElementType } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Button } from '../components/ui/button'
import { resourceConfigs } from '../features/resources/resourceConfig'
import { useAuthStore } from '../store/authStore'
import { cn } from '../utils/cn'
import { initials } from '../utils/format'

type NavItem = {
  label: string
  to: string
  roles: readonly string[]
  Icon: ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', roles: ['Admin', 'Doctor', 'Receptionist'] as const, Icon: LayoutDashboard },
  ...Object.values(resourceConfigs).map((config) => ({
    label: config.title,
    to: `/${config.key}`,
    roles: config.roles,
    Icon: config.icon,
  })),
  { label: 'Profile', to: '/profile', roles: ['Admin', 'Doctor', 'Receptionist'] as const, Icon: UserRound },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('smartclinic.theme') === 'dark')
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('smartclinic.theme', dark ? 'dark' : 'light')
  }, [dark])

  const visibleNav = navItems.filter((item) => user?.role && item.roles.includes(user.role))

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
            SC
          </div>
          <div>
            <p className="font-semibold">Smart Clinic</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">{user?.role ?? 'Clinic'}</p>
          </div>
        </div>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNav.map((item) => {
          const Icon = item.Icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-[rgb(var(--primary)/0.14)] text-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]',
                )
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-[rgb(var(--border))] p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[rgb(var(--muted))] text-sm font-semibold">
            {initials(user?.fullName ?? user?.role)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.fullName ?? user?.role}</p>
            <p className="truncate text-xs text-[rgb(var(--muted-foreground))]">{user?.email ?? `Clinic #${user?.clinicId ?? 0}`}</p>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <div className="hidden lg:block">{sidebar}</div>
      {sidebarOpen ? <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
      <div className={cn('fixed inset-y-0 left-0 z-50 transition lg:hidden', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebar}
      </div>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--background)/0.86)] px-4 backdrop-blur-xl sm:px-6">
          <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <div className="relative hidden flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <input
              className="h-10 w-full max-w-xl rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] pl-9 pr-3 text-sm outline-none"
              placeholder="Search in your clinic work"
              readOnly
            />
          </div>
          <Button variant="secondary" size="icon" onClick={() => setDark((value) => !value)} aria-label="Change colors">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              logout()
              queryClient.clear()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
