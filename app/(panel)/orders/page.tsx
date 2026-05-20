import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/features/panel/orders-table"
import { getPanelOrders } from "@/lib/storage/panel-store"

export default async function OrdersPage() {
  const orders = await getPanelOrders()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">주문 관리</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">주문내역</h1>
        <p className="mt-1 text-sm text-muted-foreground">저장된 주문을 확인하고 외부 패널 상태를 갱신합니다.</p>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>주문 목록</CardTitle>
          <CardDescription>주문번호, 서비스, 수량, 금액, 상태, 생성일을 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable initialOrders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
