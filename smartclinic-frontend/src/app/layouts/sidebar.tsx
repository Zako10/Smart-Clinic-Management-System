import {
  Activity,
  CalendarClock,
  CreditCard,
  Gauge,
  Hospital,
  ReceiptText,
  Stethoscope,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import type { UserRole } from '@/shared/types/roles'

type NavItem = {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Gauge },
  { label: 'Clinics', href: '/clinics', icon: Hospital, roles: ['Admin'] },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope, roles: ['Admin', 'Doctor'] },
  { label: 'Patients', href: '/patients', icon: Users, roles: ['Admin', 'Receptionist'] },
  { label: 'Appointments', href: '/appointments', icon: CalendarClock, roles: ['Admin', 'Doctor', 'Receptionist'] },
  { label: 'Invoices', href: '/invoices', icon: ReceiptText, roles: ['Admin', 'Receptionist'] },
  { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['Admin', 'Receptionist'] },
]

export function Sidebar({ role, onNavigate }: { role?: UserRole; onNavigate?: () => void }) {
  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)))

  return (
    <aside className="flex h-full flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Smart Clinic</p>
          <p className="truncate text-xs text-muted-foreground">Operations suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
