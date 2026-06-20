import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useRegister } from '@/features/auth/hooks/use-auth'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/auth.schemas'
import { ApiError } from '@/shared/api/http-client'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FieldError } from '@/shared/ui/field-error'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function RegisterPage() {
  const register = useRegister()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      clinicId: 1,
    },
  })

  const rootError = register.error instanceof ApiError ? register.error.message : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create receptionist access</CardTitle>
        <CardDescription>Registration creates a receptionist account for an existing clinic.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => register.mutate(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register('firstName')} />
              <FieldError message={form.formState.errors.firstName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register('lastName')} />
              <FieldError message={form.formState.errors.lastName?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" autoComplete="tel" {...form.register('phone')} />
            <FieldError message={form.formState.errors.phone?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicId">Clinic ID</Label>
              <Input id="clinicId" type="number" min={1} {...form.register('clinicId', { valueAsNumber: true })} />
              <FieldError message={form.formState.errors.clinicId?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register('password')}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
          </div>

          <FieldError message={rootError} />

          <Button className="w-full" type="submit" disabled={register.isPending}>
            {register.isPending ? <Loader2 className="animate-spin" /> : null}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have access?{' '}
          <Link className="font-medium text-primary hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
