import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-[rgb(var(--primary))]">403</p>
        <h1 className="mt-2 text-3xl font-semibold">Access restricted</h1>
        <p className="mt-2 text-[rgb(var(--muted-foreground))]">Your role cannot open this workspace area.</p>
        <Link className="mt-6 inline-flex" to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </main>
  )
}

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-[rgb(var(--primary))]">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-[rgb(var(--muted-foreground))]">The route does not exist in Smart Clinic.</p>
        <Link className="mt-6 inline-flex" to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </main>
  )
}
