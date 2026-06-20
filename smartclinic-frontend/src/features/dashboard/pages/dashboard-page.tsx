import { CalendarClock, CreditCard, ReceiptText, Stethoscope, Users } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

const metrics = [
  { label: 'Appointments today', value: '18', delta: '+12%', icon: CalendarClock },
  { label: 'Active patients', value: '1,284', delta: '+4.2%', icon: Users },
  { label: 'Doctors on duty', value: '12', delta: 'Stable', icon: Stethoscope },
  { label: 'Pending invoices', value: '37', delta: '-8%', icon: ReceiptText },
]

const queue = [
  { patient: 'Mona Adel', type: 'Follow-up', time: '09:30', status: 'Checked in' },
  { patient: 'Karim Hassan', type: 'Consultation', time: '10:10', status: 'Waiting' },
  { patient: 'Nour Samir', type: 'Cardiology', time: '10:40', status: 'With doctor' },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Clinic command center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor patient flow, billing pressure, and operational load.
          </p>
        </div>
        <Badge variant="success">Live workspace</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.delta} from last period</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Patient flow</CardTitle>
            <CardDescription>Current queue for front desk and clinical staff.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={`${item.patient}-${item.time}`}
                  className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <p className="font-medium">{item.patient}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <Badge variant="outline">{item.time}</Badge>
                  <Badge variant={item.status === 'Waiting' ? 'warning' : 'secondary'}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue snapshot</CardTitle>
            <CardDescription>Payments and invoice status for the current cycle.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-background p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collected today</p>
                  <p className="mt-2 text-3xl font-semibold">EGP 42.8k</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CreditCard className="size-5" />
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-muted">
                <div className="h-2 w-3/4 rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">75% of expected daily collections.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
