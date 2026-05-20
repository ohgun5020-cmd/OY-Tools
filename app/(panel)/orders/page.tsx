import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/features/panel/orders-table"
import { getPanelOrders } from "@/lib/storage/panel-store"

export default async function OrdersPage() {
  const orders = await getPanelOrders()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">History</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stored order history with one-click provider status refresh.</p>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>Order ledger</CardTitle>
          <CardDescription>Provider order id, service, amount, status, and creation time.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable initialOrders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
