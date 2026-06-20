import { LogOut, Menu, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers/theme-context'
import { useLogout } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <Button className="lg:hidden" variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation">
        <Menu />
      </Button>

      <div className="hidden h-10 min-w-0 flex-1 items-center gap-3 rounded-md border bg-card px-3 text-sm text-muted-foreground md:flex">
        <Search className="size-4" />
        <span className="truncate">Search patients, invoices, or appointments</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
      </Button>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="truncate text-sm font-medium">{user?.fullName ?? 'Clinic user'}</p>
          <p className="text-xs text-muted-foreground">Clinic #{user?.clinicId ?? '-'}</p>
        </div>
        {user?.role ? <Badge variant="secondary">{user.role}</Badge> : null}
      </div>

      <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
        <LogOut />
      </Button>
    </header>
  )
}
