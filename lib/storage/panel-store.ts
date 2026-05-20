import type { CreateOrderInput, PanelOrder, PanelOrderStatus, PanelService, PanelSettings } from "@/types/panel"
import { estimateCharge } from "@/features/panel/format"
import { defaultPanelSettings, demoOrders, demoServices } from "@/features/panel/mock-data"
import { createSmmOrder, getSmmOrderStatus, listSmmServices, normalizeStatus } from "@/lib/smm/client"
import { getSupabaseAdmin } from "@/lib/storage/supabase"

type MemoryStore = {
  orders: PanelOrder[]
  services: PanelService[]
  settings: PanelSettings
}

const globalStore = globalThis as typeof globalThis & {
  __oyPanelMemoryStore?: MemoryStore
}

const memoryStore =
  globalStore.__oyPanelMemoryStore ||
  (globalStore.__oyPanelMemoryStore = {
    orders: [...demoOrders],
    services: [...demoServices],
    settings: { ...defaultPanelSettings },
  })

export async function getPanelOrders() {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.orders
  }

  const { data, error } = await supabase
    .from("oy_panel_orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase order query failed", error.message)
    return memoryStore.orders
  }

  return (data || []).map(mapOrderFromRow)
}

export async function getPanelOrder(id: string) {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.orders.find((order) => order.id === id) || null
  }

  const { data, error } = await supabase.from("oy_panel_orders").select("*").eq("id", id).maybeSingle()

  if (error) {
    console.error("Supabase single order query failed", error.message)
    return memoryStore.orders.find((order) => order.id === id) || null
  }

  return data ? mapOrderFromRow(data) : null
}

export async function createPanelOrder(input: CreateOrderInput) {
  const services = await getPanelServices()
  const service = services.find((item) => item.providerServiceId === input.serviceId || item.id === input.serviceId)

  if (!service) {
    throw new Error("Selected service was not found.")
  }

  if (!service.isEnabled) {
    throw new Error("Selected service is currently disabled.")
  }

  if (input.quantity < service.min || input.quantity > service.max) {
    throw new Error(`Quantity must be between ${service.min} and ${service.max}.`)
  }

  const settings = await getPanelSettings()
  const provider = await createSmmOrder({
    serviceId: service.providerServiceId,
    link: input.link,
    quantity: input.quantity,
  })

  const now = new Date().toISOString()
  const order: PanelOrder = {
    id: crypto.randomUUID(),
    providerOrderId: provider.providerOrderId,
    platform: service.platform,
    serviceId: service.providerServiceId,
    serviceName: service.name,
    link: input.link,
    quantity: input.quantity,
    charge: estimateCharge(service.rate, input.quantity, settings.marginRate),
    currency: service.currency || settings.currency,
    status: "Pending",
    remains: input.quantity,
    startCount: null,
    createdAt: now,
    updatedAt: now,
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.orders = [order, ...memoryStore.orders]
    return order
  }

  const { data, error } = await supabase.from("oy_panel_orders").insert(mapOrderToRow(order)).select("*").single()

  if (error) {
    console.error("Supabase order insert failed", error.message)
    memoryStore.orders = [order, ...memoryStore.orders]
    return order
  }

  return mapOrderFromRow(data)
}

export async function refreshPanelOrderStatus(id: string) {
  const order = await getPanelOrder(id)

  if (!order) {
    throw new Error("Order was not found.")
  }

  const providerStatus = await getSmmOrderStatus(order.providerOrderId)
  const updated: Partial<PanelOrder> = {
    status: normalizeStatus(providerStatus.status),
    charge: Number(providerStatus.charge || order.charge),
    remains: toNullableNumber(providerStatus.remains),
    startCount: toNullableNumber(providerStatus.start_count),
    updatedAt: new Date().toISOString(),
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.orders = memoryStore.orders.map((item) => (item.id === id ? { ...item, ...updated } : item))
    return memoryStore.orders.find((item) => item.id === id)!
  }

  const { data, error } = await supabase
    .from("oy_panel_orders")
    .update({
      status: updated.status,
      charge: updated.charge,
      remains: updated.remains,
      start_count: updated.startCount,
      raw_status: providerStatus,
      updated_at: updated.updatedAt,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("Supabase order status update failed", error.message)
    memoryStore.orders = memoryStore.orders.map((item) => (item.id === id ? { ...item, ...updated } : item))
    return memoryStore.orders.find((item) => item.id === id)!
  }

  return mapOrderFromRow(data)
}

export async function getPanelServices() {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.services
  }

  const { data, error } = await supabase
    .from("oy_panel_services")
    .select("*")
    .order("is_favorite", { ascending: false })
    .order("platform", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Supabase service query failed", error.message)
    return memoryStore.services
  }

  if (!data?.length) {
    try {
      return await syncPanelServices()
    } catch (error) {
      console.error("Provider service sync failed", error)
      return memoryStore.services
    }
  }

  return data.map(mapServiceFromRow)
}

export async function syncPanelServices() {
  const previous = await getPanelServicesSafely()
  const previousById = new Map(previous.map((service) => [service.providerServiceId, service]))
  const incoming = await listSmmServices()
  const services = incoming.map((service) => {
    const existing = previousById.get(service.providerServiceId)

    return {
      ...service,
      id: service.providerServiceId,
      isFavorite: existing?.isFavorite ?? service.isFavorite,
      isEnabled: existing?.isEnabled ?? service.isEnabled,
      updatedAt: new Date().toISOString(),
    }
  })

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.services = services
    return memoryStore.services
  }

  const { data, error } = await supabase
    .from("oy_panel_services")
    .upsert(services.map(mapServiceToRow), { onConflict: "service_id" })
    .select("*")

  if (error) {
    console.error("Supabase service upsert failed", error.message)
    memoryStore.services = services
    return memoryStore.services
  }

  return (data || []).map(mapServiceFromRow)
}

export async function updatePanelServicePreference(
  serviceId: string,
  patch: Partial<Pick<PanelService, "isFavorite" | "isEnabled">>,
) {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.services = memoryStore.services.map((service) =>
      service.providerServiceId === serviceId ? { ...service, ...patch, updatedAt: new Date().toISOString() } : service,
    )

    return memoryStore.services.find((service) => service.providerServiceId === serviceId) || null
  }

  const { data, error } = await supabase
    .from("oy_panel_services")
    .update({
      is_favorite: patch.isFavorite,
      is_enabled: patch.isEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("service_id", serviceId)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("Supabase service preference update failed", error.message)
    memoryStore.services = memoryStore.services.map((service) =>
      service.providerServiceId === serviceId ? { ...service, ...patch, updatedAt: new Date().toISOString() } : service,
    )

    return memoryStore.services.find((service) => service.providerServiceId === serviceId) || null
  }

  return data ? mapServiceFromRow(data) : null
}

export async function getPanelSettings(): Promise<PanelSettings> {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.settings
  }

  const { data, error } = await supabase
    .from("oy_panel_settings")
    .select("value")
    .eq("key", "default")
    .maybeSingle()

  if (error) {
    console.error("Supabase settings query failed", error.message)
    return memoryStore.settings
  }

  return {
    ...defaultPanelSettings,
    ...(data?.value as Partial<PanelSettings> | undefined),
  }
}

export async function updatePanelSettings(settings: Partial<PanelSettings>) {
  const nextSettings = {
    ...(await getPanelSettings()),
    ...settings,
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.settings = nextSettings
    return memoryStore.settings
  }

  const { data, error } = await supabase
    .from("oy_panel_settings")
    .upsert({
      key: "default",
      value: nextSettings,
      updated_at: new Date().toISOString(),
    })
    .select("value")
    .single()

  if (error) {
    console.error("Supabase settings update failed", error.message)
    memoryStore.settings = nextSettings
    return memoryStore.settings
  }

  return data.value as PanelSettings
}

async function getPanelServicesSafely() {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.services
  }

  const { data } = await supabase.from("oy_panel_services").select("*")

  return (data || []).map(mapServiceFromRow)
}

function mapOrderFromRow(row: Record<string, any>): PanelOrder {
  return {
    id: row.id,
    providerOrderId: row.provider_order_id,
    platform: row.platform,
    serviceId: row.service_id,
    serviceName: row.service_name,
    link: row.link,
    quantity: Number(row.quantity),
    charge: Number(row.charge || 0),
    currency: row.currency || "USD",
    status: row.status as PanelOrderStatus,
    remains: toNullableNumber(row.remains),
    startCount: toNullableNumber(row.start_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapOrderToRow(order: PanelOrder) {
  return {
    id: order.id,
    provider_order_id: order.providerOrderId,
    platform: order.platform,
    service_id: order.serviceId,
    service_name: order.serviceName,
    link: order.link,
    quantity: order.quantity,
    charge: order.charge,
    currency: order.currency,
    status: order.status,
    remains: order.remains,
    start_count: order.startCount,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  }
}

function mapServiceFromRow(row: Record<string, any>): PanelService {
  return {
    id: row.service_id,
    providerServiceId: row.service_id,
    platform: row.platform,
    category: row.category,
    name: row.name,
    type: row.type,
    rate: Number(row.rate || 0),
    min: Number(row.min_quantity || 0),
    max: Number(row.max_quantity || 0),
    currency: row.currency || "USD",
    isFavorite: Boolean(row.is_favorite),
    isEnabled: Boolean(row.is_enabled),
    updatedAt: row.updated_at,
    raw: row.raw || undefined,
  }
}

function mapServiceToRow(service: PanelService) {
  return {
    service_id: service.providerServiceId,
    name: service.name,
    category: service.category,
    platform: service.platform,
    type: service.type,
    rate: service.rate,
    min_quantity: service.min,
    max_quantity: service.max,
    currency: service.currency,
    is_favorite: service.isFavorite,
    is_enabled: service.isEnabled,
    raw: service.raw || null,
    updated_at: service.updatedAt,
  }
}

function toNullableNumber(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}
