import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Activity, ArrowRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiMessage } from '../../api/client'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input } from '../../components/ui/input'
import { useToast } from '../../hooks/useToast'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(6, 'Required'),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function AuthFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Smart Clinic</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Clinic daily work made simple</p>
            </div>
          </div>
          <Card className="p-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">{description}</p>
            <div className="mt-6">{children}</div>
          </Card>
        </div>
      </section>
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-lg">
          <div className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs text-teal-100">
            Everything your clinic needs in one place
          </div>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">
            Manage patients, visits, bills, and payments without confusion.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Each person sees the work that matters to them, whether they are a doctor, receptionist, or manager.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Visits', 'Bills', 'Patients'].map((label) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold">Live</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (auth) => {
      setSession(auth)
      try {
        const me = await authService.me()
        useAuthStore.getState().setCurrentUser({ ...me, email: auth.email, fullName: auth.fullName })
      } catch {
        // The JWT is still usable; /me failure will be handled by protected routes.
      }
      toast({ kind: 'success', title: 'Welcome back', description: `You are signed in as ${auth.role}` })
      navigate('/dashboard')
    },
    onError: (error) => toast({ kind: 'error', title: 'Could not sign in', description: getApiMessage(error) }),
  })

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <AuthFrame title="Sign in" description="Use your clinic account to continue.">
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input className="pl-9" type="email" autoComplete="email" {...form.register('email')} />
          </div>
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input className="pl-9" type="password" autoComplete="current-password" {...form.register('password')} />
          </div>
        </Field>
        <Button className="mt-2 w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Please wait...' : 'Sign in'}
          <ArrowRight className="size-4" />
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[rgb(var(--muted-foreground))]">
        New here? <Link className="font-medium text-[rgb(var(--primary))]" to="/register">Create an account</Link>
      </p>
    </AuthFrame>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', phone: '' },
  })
  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (auth) => {
      setSession(auth)
      try {
        const me = await authService.me()
        useAuthStore.getState().setCurrentUser({ ...me, email: auth.email, fullName: auth.fullName })
      } catch {
        // Protected routes will retry /me if the first lookup fails.
      }
      toast({ kind: 'success', title: 'Account created', description: `You can now work as ${auth.role}` })
      navigate('/dashboard')
    },
    onError: (error) => toast({ kind: 'error', title: 'Could not create account', description: getApiMessage(error) }),
  })

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <AuthFrame title="Create account" description="Create a clinic staff account. Admin access is assigned by management.">
      <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--muted))] px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
          New public accounts are created as Receptionist accounts. A clinic admin can assign elevated access separately.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={form.formState.errors.firstName?.message}>
            <Input {...form.register('firstName')} />
          </Field>
          <Field label="Last name" error={form.formState.errors.lastName?.message}>
            <Input {...form.register('lastName')} />
          </Field>
        </div>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input className="pl-9" type="email" {...form.register('email')} />
          </div>
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
            <Input className="pl-9" type="tel" {...form.register('phone')} />
          </div>
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...form.register('password')} />
        </Field>
        <Button className="mt-2 w-full" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Please wait...' : 'Create account'}
          <ArrowRight className="size-4" />
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[rgb(var(--muted-foreground))]">
        Already have an account? <Link className="font-medium text-[rgb(var(--primary))]" to="/login">Sign in</Link>
      </p>
    </AuthFrame>
  )
}
