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
        <p className="text-sm font-medium text-primary">서비스 관리</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">서비스 목록</h1>
        <p className="mt-1 text-sm text-muted-foreground">외부 패널 서비스를 불러오고 자주 쓰는 서비스만 정리합니다.</p>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>외부 패널 서비스</CardTitle>
          <CardDescription>서비스 ID, 이름, 단가, 최소/최대 수량, 즐겨찾기와 사용 여부를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesTable initialServices={services} serviceOrderCounts={serviceOrderCounts} />
        </CardContent>
      </Card>
    </div>
  )
}
