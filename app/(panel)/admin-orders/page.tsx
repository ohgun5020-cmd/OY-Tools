import { AdminOrderConsole } from "@/features/panel/admin-order-console"
import { getInstagramConnectionState } from "@/lib/instagram/client"
import { getAdminOrderCandidates, getPanelServices } from "@/lib/storage/panel-store"

export default async function AdminOrdersPage() {
  const [candidates, services] = await Promise.all([getAdminOrderCandidates(), getPanelServices()])

  return (
    <AdminOrderConsole
      initialCandidates={candidates}
      services={services}
      instagramConnection={getInstagramConnectionState()}
    />
  )
}
