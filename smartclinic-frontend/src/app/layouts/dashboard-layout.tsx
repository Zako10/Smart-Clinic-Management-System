import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/app/layouts/sidebar'
import { Topbar } from '@/app/layouts/topbar'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { cn } from '@/shared/lib/utils'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const role = useAuthStore((state) => state.user?.role)

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar role={role} />
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar role={role} onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
