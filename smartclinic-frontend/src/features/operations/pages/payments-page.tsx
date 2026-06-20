import { CreditCard } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post payments against invoices and keep billing state synchronized.
          </p>
        </div>
        <Button>
          <CreditCard />
          Post payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment workspace</CardTitle>
          <CardDescription>
            The backend currently exposes payment creation. Listing and reconciliation can be added when
            the API exposes read endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
            Payment posting should be implemented as a form connected to `POST /api/payment`, with
            invoice lookup and remaining-balance validation in the UI.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
