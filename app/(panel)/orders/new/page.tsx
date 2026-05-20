import { NewOrderForm } from "@/features/panel/new-order-form"
import { getPanelServices, getPanelSettings } from "@/lib/storage/panel-store"

export default async function NewOrderPage() {
  const [services, settings] = await Promise.all([getPanelServices(), getPanelSettings()])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">주문 생성</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">새 주문</h1>
        <p className="mt-1 text-sm text-muted-foreground">서비스를 고르고 링크와 수량을 입력해 주문을 실행합니다.</p>
      </div>
      <NewOrderForm services={services} settings={settings} />
    </div>
  )
}
