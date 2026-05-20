import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServicesTable } from "@/features/panel/services-table"
import { getPanelOrders, getPanelServices } from "@/lib/storage/panel-store"

export default async function ServicesPage() {
  const [services, orders] = await Promise.all([getPanelServices(), getPanelOrders()])
  const serviceOrderCounts = orders.reduce<Record<string, number>>((counts, order) => {
    counts[order.serviceId] = (counts[order.serviceId] || 0) + 1
    return counts
  }, {})

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">Catalog</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sync provider services, favorite frequent items, and disable risky services.</p>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>Provider services</CardTitle>
          <CardDescription>Service id, name, rate, min/max quantity, favorites, and availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesTable initialServices={services} serviceOrderCounts={serviceOrderCounts} />
        </CardContent>
      </Card>
    </div>
  )
}
