import { NewOrderForm } from "@/features/panel/new-order-form"
import { getPanelServices, getPanelSettings } from "@/lib/storage/panel-store"

export default async function NewOrderPage() {
  const [services, settings] = await Promise.all([getPanelServices(), getPanelSettings()])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">Create</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">New order</h1>
        <p className="mt-1 text-sm text-muted-foreground">Select a provider service, enter the target link, and execute.</p>
      </div>
      <NewOrderForm services={services} settings={settings} />
    </div>
  )
}
