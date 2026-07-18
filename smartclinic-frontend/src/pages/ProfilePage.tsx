import { BadgeCheck, Building2, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Card, CardHeader } from '../components/ui/card'
import { resourceConfigs } from '../features/resources/resourceConfig'
import { useAuthStore } from '../store/authStore'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const visibleResources = Object.values(resourceConfigs).filter((config) => user?.role && config.roles.includes(user.role))

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">Your current signed-in account and access level.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card>
          <CardHeader title="Current user" description="Read from your JWT and the /me endpoint." />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <ProfileItem icon={UserRound} label="Name" value={user?.fullName ?? 'Clinic user'} />
            <ProfileItem icon={Mail} label="Email" value={user?.email ?? 'Not available'} />
            <ProfileItem icon={ShieldCheck} label="Role" value={user?.role ?? 'Unknown'} />
            <ProfileItem icon={Building2} label="Clinic" value={`#${user?.clinicId ?? 0}`} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Access" description="Pages available to this role." />
          <div className="flex flex-wrap gap-2 p-5">
            {visibleResources.map((resource) => (
              <Badge key={resource.key} tone="neutral">
                {resource.title}
              </Badge>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--muted)/0.45)] p-4">
      <div className="grid size-10 place-items-center rounded-lg bg-[rgb(var(--primary)/0.12)] text-[rgb(var(--primary))]">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[rgb(var(--muted-foreground))]">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
      <BadgeCheck className="ml-auto size-4 text-[rgb(var(--primary))]" />
    </div>
  )
}
