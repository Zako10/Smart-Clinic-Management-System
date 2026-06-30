import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../components/ui/input'
import type { FieldConfig, ResourceConfig } from './resourceConfig'

type FormValues = Record<string, string | number>

function valueFromItem(item: Record<string, unknown> | null, name: string, fallback: string | number) {
  if (!item) return fallback
  if (name === 'firstName' || name === 'lastName') {
    const fullName = String(item.fullName ?? '')
    const parts = fullName.split(' ')
    return name === 'firstName' ? parts[0] ?? '' : parts.slice(1).join(' ')
  }
  const value = item[name]
  if (name === 'dateTime' && typeof value === 'string') {
    return value.slice(0, 16)
  }
  return typeof value === 'number' || typeof value === 'string' ? value : fallback
}

function FormField({
  field,
  register,
  error,
}: {
  field: FieldConfig
  register: ReturnType<typeof useForm<FormValues>>['register']
  error?: string
}) {
  if (field.type === 'textarea') {
    return (
      <Field label={field.label} error={error}>
        <Textarea {...register(field.name)} />
      </Field>
    )
  }
  if (field.type === 'select') {
    return (
      <Field label={field.label} error={error}>
        <Select {...register(field.name)}>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
    )
  }
  return (
    <Field label={field.label} error={error}>
      <Input type={field.type ?? 'text'} step={field.type === 'number' ? '0.01' : undefined} {...register(field.name)} />
    </Field>
  )
}

export function ResourceForm<T extends { id: number }>({
  config,
  item,
  pending,
  onSubmit,
  onCancel,
}: {
  config: ResourceConfig<T>
  item: T | null
  pending?: boolean
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(config.schema as never) as never,
    defaultValues: config.defaults,
  })

  useEffect(() => {
    reset(
      Object.fromEntries(
        Object.entries(config.defaults).map(([key, fallback]) => [
          key,
          valueFromItem(item as Record<string, unknown> | null, key, fallback),
        ]),
      ),
    )
  }, [config.defaults, item, reset])

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            register={register}
            error={errors[field.name]?.message?.toString()}
          />
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : item ? 'Save changes' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
