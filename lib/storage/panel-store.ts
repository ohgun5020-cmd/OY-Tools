import type {
  AdminOrderCandidate,
  AdminOrderItem,
  AdminOrderStatus,
  CreateOrderInput,
  PanelOrder,
  PanelOrderStatus,
  PanelService,
  PanelSettings,
} from "@/types/panel"
import { estimateCharge } from "@/features/panel/format"
import { defaultPanelSettings, demoOrders, demoServices } from "@/features/panel/mock-data"
import { createSmmOrder, getSmmOrderStatus, listSmmServices, normalizeStatus } from "@/lib/smm/client"
import { isPostgresConfigured, queryPostgres } from "@/lib/storage/postgres"
import { getSupabaseAdmin } from "@/lib/storage/supabase"

type MemoryStore = {
  adminOrders: AdminOrderCandidate[]
  orders: PanelOrder[]
  services: PanelService[]
  settings: PanelSettings
}

const globalStore = globalThis as typeof globalThis & {
  __oyPanelMemoryStore?: MemoryStore
}

type CreateAdminOrderCandidateInput = {
  targetUrl: string
  source?: AdminOrderCandidate["source"]
  profileUrl?: string | null
  mediaId?: string | null
  mediaType?: string | null
  caption?: string | null
  detectedAt?: string | null
  items?: AdminOrderItem[]
  raw?: Record<string, unknown> | null
}

const memoryStore =
  globalStore.__oyPanelMemoryStore ||
  (globalStore.__oyPanelMemoryStore = {
    adminOrders: [],
    orders: [...demoOrders],
    services: [...demoServices],
    settings: { ...defaultPanelSettings },
  })

export async function getAdminOrderCandidates() {
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_admin_orders
        order by created_at desc
        `,
      )

      if (result) {
        return result.rows.map(mapAdminOrderFromRow)
      }
    } catch (error) {
      console.error("Postgres admin order query failed", error)
      return memoryStore.adminOrders
    }
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.adminOrders
  }

  const { data, error } = await supabase
    .from("oy_panel_admin_orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase admin order query failed", error.message)
    return memoryStore.adminOrders
  }

  return (data || []).map(mapAdminOrderFromRow)
}

export async function getAdminOrderCandidate(id: string) {
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_admin_orders
        where id = $1
        limit 1
        `,
        [id],
      )

      if (result) {
        return result.rows[0] ? mapAdminOrderFromRow(result.rows[0]) : null
      }
    } catch (error) {
      console.error("Postgres single admin order query failed", error)
      return memoryStore.adminOrders.find((candidate) => candidate.id === id) || null
    }
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.adminOrders.find((candidate) => candidate.id === id) || null
  }

  const { data, error } = await supabase.from("oy_panel_admin_orders").select("*").eq("id", id).maybeSingle()

  if (error) {
    console.error("Supabase single admin order query failed", error.message)
    return memoryStore.adminOrders.find((candidate) => candidate.id === id) || null
  }

  return data ? mapAdminOrderFromRow(data) : null
}

export async function findAdminOrderCandidateByTargetUrl(targetUrl: string) {
  const normalizedUrl = targetUrl.trim()

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_admin_orders
        where target_url = $1
        order by created_at desc
        limit 1
        `,
        [normalizedUrl],
      )

      if (result) {
        return result.rows[0] ? mapAdminOrderFromRow(result.rows[0]) : null
      }
    } catch (error) {
      console.error("Postgres admin order duplicate query failed", error)
      return memoryStore.adminOrders.find((candidate) => candidate.targetUrl === normalizedUrl) || null
    }
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return memoryStore.adminOrders.find((candidate) => candidate.targetUrl === normalizedUrl) || null
  }

  const { data, error } = await supabase
    .from("oy_panel_admin_orders")
    .select("*")
    .eq("target_url", normalizedUrl)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Supabase admin order duplicate query failed", error.message)
    return memoryStore.adminOrders.find((candidate) => candidate.targetUrl === normalizedUrl) || null
  }

  return data ? mapAdminOrderFromRow(data) : null
}

export async function createAdminOrderCandidate(input: CreateAdminOrderCandidateInput) {
  const now = new Date().toISOString()
  const candidate: AdminOrderCandidate = {
    id: crypto.randomUUID(),
    source: input.source || "manual",
    targetUrl: input.targetUrl.trim(),
    profileUrl: input.profileUrl || null,
    mediaId: input.mediaId || null,
    mediaType: input.mediaType || null,
    caption: input.caption || null,
    detectedAt: input.detectedAt || now,
    status: "Review",
    items: input.items || [],
    createdOrderIds: [],
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  }

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        insert into public.oy_panel_admin_orders (
          id,
          source,
          target_url,
          profile_url,
          media_id,
          media_type,
          caption,
          detected_at,
          status,
          items,
          created_order_ids,
          error_message,
          raw,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        returning *
        `,
        [
          candidate.id,
          candidate.source,
          candidate.targetUrl,
          candidate.profileUrl,
          candidate.mediaId,
          candidate.mediaType,
          candidate.caption,
          candidate.detectedAt,
          candidate.status,
          JSON.stringify(candidate.items),
          JSON.stringify(candidate.createdOrderIds),
          candidate.errorMessage,
          JSON.stringify(input.raw || null),
          candidate.createdAt,
          candidate.updatedAt,
        ],
      )

      if (result?.rows[0]) {
        return mapAdminOrderFromRow(result.rows[0])
      }
    } catch (error) {
      console.error("Postgres admin order insert failed", error)
      memoryStore.adminOrders = [candidate, ...memoryStore.adminOrders]
      return candidate
    }
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.adminOrders = [candidate, ...memoryStore.adminOrders]
    return candidate
  }

  const { data, error } = await supabase
    .from("oy_panel_admin_orders")
    .insert(mapAdminOrderToRow(candidate, input.raw || null))
    .select("*")
    .single()

  if (error) {
    console.error("Supabase admin order insert failed", error.message)
    memoryStore.adminOrders = [candidate, ...memoryStore.adminOrders]
    return candidate
  }

  return mapAdminOrderFromRow(data)
}

export async function buildAdminOrderItem(serviceId: string, quantity: number): Promise<AdminOrderItem> {
  const services = await getPanelServices()
  const service = services.find((item) => item.providerServiceId === serviceId || item.id === serviceId)

  if (!service) {
    throw new Error("관리자 오더에 사용할 서비스를 찾을 수 없습니다.")
  }

  if (!service.isEnabled) {
    throw new Error("선택한 서비스가 비활성화되어 있습니다.")
  }

  if (quantity < service.min || quantity > service.max) {
    throw new Error(`수량은 ${service.min}개 이상 ${service.max}개 이하여야 합니다.`)
  }

  return {
    id: crypto.randomUUID(),
    serviceId: service.providerServiceId,
    serviceName: service.name,
    platform: service.platform,
    quantity,
    rate: service.rate,
    currency: service.currency,
  }
}

export async function executeAdminOrderCandidate(id: string) {
  const candidate = await getAdminOrderCandidate(id)

  if (!candidate) {
    throw new Error("관리자 오더 후보를 찾을 수 없습니다.")
  }

  if (candidate.status === "Executed") {
    return { candidate, orders: [] as PanelOrder[] }
  }

  if (!candidate.items.length) {
    throw new Error("실행할 주문 항목이 없습니다.")
  }

  const orders: PanelOrder[] = []

  try {
    for (const item of candidate.items) {
      const order = await createPanelOrder({
        serviceId: item.serviceId,
        link: candidate.targetUrl,
        quantity: item.quantity,
      })
      orders.push(order)
    }

    const updated = await updateAdminOrderCandidate(candidate.id, {
      status: "Executed",
      createdOrderIds: orders.map((order) => order.id),
      errorMessage: null,
    })

    return { candidate: updated, orders }
  } catch (error) {
    const message = error instanceof Error ? error.message : "관리자 오더 실행에 실패했습니다."
    const updated = await updateAdminOrderCandidate(candidate.id, {
      status: "Failed",
      createdOrderIds: orders.map((order) => order.id),
      errorMessage: message,
    })

    throw new Error(updated.errorMessage || message)
  }
}

export async function updateAdminOrderCandidate(
  id: string,
  patch: Partial<Pick<AdminOrderCandidate, "status" | "createdOrderIds" | "errorMessage">>,
) {
  const updatedAt = new Date().toISOString()

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        update public.oy_panel_admin_orders
        set
          status = coalesce($1::text, status),
          created_order_ids = coalesce($2::jsonb, created_order_ids),
          error_message = $3,
          updated_at = $4
        where id = $5
        returning *
        `,
        [
          patch.status,
          patch.createdOrderIds ? JSON.stringify(patch.createdOrderIds) : null,
          patch.errorMessage ?? null,
          updatedAt,
          id,
        ],
      )

      if (result?.rows[0]) {
        return mapAdminOrderFromRow(result.rows[0])
      }
    } catch (error) {
      console.error("Postgres admin order update failed", error)
    }
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    memoryStore.adminOrders = memoryStore.adminOrders.map((candidate) =>
      candidate.id === id ? { ...candidate, ...patch, updatedAt } : candidate,
    )
    return memoryStore.adminOrders.find((candidate) => candidate.id === id)!
  }

  const { data, error } = await supabase
    .from("oy_panel_admin_orders")
    .update({
      status: patch.status,
      created_order_ids: patch.createdOrderIds,
      error_message: patch.errorMessage ?? null,
      updated_at: updatedAt,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("Supabase admin order update failed", error.message)
    memoryStore.adminOrders = memoryStore.adminOrders.map((candidate) =>
      candidate.id === id ? { ...candidate, ...patch, updatedAt } : candidate,
    )
    return memoryStore.adminOrders.find((candidate) => candidate.id === id)!
  }

  return mapAdminOrderFromRow(data)
}

export async function getPanelOrders() {
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_orders
        order by created_at desc
        `,
      )

      if (result) {
        return result.rows.map(mapOrderFromRow)
      }
    } catch (error) {
      console.error("Postgres order query failed", error)
      return memoryStore.orders
    }
  }

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
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_orders
        where id = $1
        limit 1
        `,
        [id],
      )

      if (result) {
        return result.rows[0] ? mapOrderFromRow(result.rows[0]) : null
      }
    } catch (error) {
      console.error("Postgres single order query failed", error)
      return memoryStore.orders.find((order) => order.id === id) || null
    }
  }

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
    throw new Error("선택한 서비스를 찾을 수 없습니다.")
  }

  if (!service.isEnabled) {
    throw new Error("선택한 서비스가 비활성화되어 있습니다.")
  }

  if (input.quantity < service.min || input.quantity > service.max) {
    throw new Error(`수량은 ${service.min}개 이상 ${service.max}개 이하여야 합니다.`)
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

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        insert into public.oy_panel_orders (
          id,
          provider_order_id,
          platform,
          service_id,
          service_name,
          link,
          quantity,
          charge,
          currency,
          status,
          remains,
          start_count,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        returning *
        `,
        [
          order.id,
          order.providerOrderId,
          order.platform,
          order.serviceId,
          order.serviceName,
          order.link,
          order.quantity,
          order.charge,
          order.currency,
          order.status,
          order.remains,
          order.startCount,
          order.createdAt,
          order.updatedAt,
        ],
      )

      if (result?.rows[0]) {
        return mapOrderFromRow(result.rows[0])
      }
    } catch (error) {
      console.error("Postgres order insert failed", error)
      memoryStore.orders = [order, ...memoryStore.orders]
      return order
    }
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
    throw new Error("주문을 찾을 수 없습니다.")
  }

  const providerStatus = await getSmmOrderStatus(order.providerOrderId)
  const updated: Partial<PanelOrder> = {
    status: normalizeStatus(providerStatus.status),
    charge: Number(providerStatus.charge || order.charge),
    remains: toNullableNumber(providerStatus.remains),
    startCount: toNullableNumber(providerStatus.start_count),
    updatedAt: new Date().toISOString(),
  }

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        update public.oy_panel_orders
        set
          status = $1,
          charge = $2,
          remains = $3,
          start_count = $4,
          raw_status = $5,
          updated_at = $6
        where id = $7
        returning *
        `,
        [
          updated.status,
          updated.charge,
          updated.remains,
          updated.startCount,
          JSON.stringify(providerStatus),
          updated.updatedAt,
          id,
        ],
      )

      if (result?.rows[0]) {
        return mapOrderFromRow(result.rows[0])
      }
    } catch (error) {
      console.error("Postgres order status update failed", error)
      memoryStore.orders = memoryStore.orders.map((item) => (item.id === id ? { ...item, ...updated } : item))
      return memoryStore.orders.find((item) => item.id === id)!
    }
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
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_services
        order by is_favorite desc, platform asc, name asc
        `,
      )

      if (result?.rows.length) {
        return result.rows.map(mapServiceFromRow)
      }

      return await syncPanelServices()
    } catch (error) {
      console.error("Postgres service query failed", error)
      return memoryStore.services
    }
  }

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

  if (isPostgresConfigured()) {
    try {
      for (const service of services) {
        await queryPostgres(
          `
          insert into public.oy_panel_services (
            service_id,
            name,
            category,
            platform,
            type,
            rate,
            min_quantity,
            max_quantity,
            currency,
            is_favorite,
            is_enabled,
            raw,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          on conflict (service_id)
          do update set
            name = excluded.name,
            category = excluded.category,
            platform = excluded.platform,
            type = excluded.type,
            rate = excluded.rate,
            min_quantity = excluded.min_quantity,
            max_quantity = excluded.max_quantity,
            currency = excluded.currency,
            is_favorite = excluded.is_favorite,
            is_enabled = excluded.is_enabled,
            raw = excluded.raw,
            updated_at = excluded.updated_at
          `,
          [
            service.providerServiceId,
            service.name,
            service.category,
            service.platform,
            service.type,
            service.rate,
            service.min,
            service.max,
            service.currency,
            service.isFavorite,
            service.isEnabled,
            JSON.stringify(service.raw || null),
            service.updatedAt,
          ],
        )
      }

      return services
    } catch (error) {
      console.error("Postgres service upsert failed", error)
      memoryStore.services = services
      return memoryStore.services
    }
  }

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
  if (isPostgresConfigured()) {
    try {
      const previous = await getPanelServicesSafely()
      const current = previous.find((service) => service.providerServiceId === serviceId)
      const nextFavorite = patch.isFavorite ?? current?.isFavorite ?? false
      const nextEnabled = patch.isEnabled ?? current?.isEnabled ?? true
      const result = await queryPostgres(
        `
        update public.oy_panel_services
        set
          is_favorite = $1,
          is_enabled = $2,
          updated_at = $3
        where service_id = $4
        returning *
        `,
        [nextFavorite, nextEnabled, new Date().toISOString(), serviceId],
      )

      return result?.rows[0] ? mapServiceFromRow(result.rows[0]) : null
    } catch (error) {
      console.error("Postgres service preference update failed", error)
      memoryStore.services = memoryStore.services.map((service) =>
        service.providerServiceId === serviceId ? { ...service, ...patch, updatedAt: new Date().toISOString() } : service,
      )

      return memoryStore.services.find((service) => service.providerServiceId === serviceId) || null
    }
  }

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
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select value
        from public.oy_panel_settings
        where key = 'default'
        limit 1
        `,
      )

      return {
        ...defaultPanelSettings,
        ...((result?.rows[0]?.value as Partial<PanelSettings> | undefined) || {}),
      }
    } catch (error) {
      console.error("Postgres settings query failed", error)
      return memoryStore.settings
    }
  }

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

  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        insert into public.oy_panel_settings (key, value, updated_at)
        values ('default', $1, $2)
        on conflict (key)
        do update set
          value = excluded.value,
          updated_at = excluded.updated_at
        returning value
        `,
        [JSON.stringify(nextSettings), new Date().toISOString()],
      )

      return (result?.rows[0]?.value as PanelSettings | undefined) || nextSettings
    } catch (error) {
      console.error("Postgres settings update failed", error)
      memoryStore.settings = nextSettings
      return memoryStore.settings
    }
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
  if (isPostgresConfigured()) {
    try {
      const result = await queryPostgres(
        `
        select *
        from public.oy_panel_services
        `,
      )

      return result ? result.rows.map(mapServiceFromRow) : memoryStore.services
    } catch {
      return memoryStore.services
    }
  }

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
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
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

function mapAdminOrderFromRow(row: Record<string, any>): AdminOrderCandidate {
  return {
    id: row.id,
    source: (row.source || "manual") as AdminOrderCandidate["source"],
    targetUrl: row.target_url,
    profileUrl: row.profile_url || null,
    mediaId: row.media_id || null,
    mediaType: row.media_type || null,
    caption: row.caption || null,
    detectedAt: row.detected_at ? toIsoString(row.detected_at) : null,
    status: (row.status || "Review") as AdminOrderStatus,
    items: normalizeJsonArray<AdminOrderItem>(row.items),
    createdOrderIds: normalizeJsonArray<string>(row.created_order_ids),
    errorMessage: row.error_message || null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  }
}

function mapAdminOrderToRow(candidate: AdminOrderCandidate, raw: Record<string, unknown> | null = null) {
  return {
    id: candidate.id,
    source: candidate.source,
    target_url: candidate.targetUrl,
    profile_url: candidate.profileUrl,
    media_id: candidate.mediaId,
    media_type: candidate.mediaType,
    caption: candidate.caption,
    detected_at: candidate.detectedAt,
    status: candidate.status,
    items: candidate.items,
    created_order_ids: candidate.createdOrderIds,
    error_message: candidate.errorMessage,
    raw,
    created_at: candidate.createdAt,
    updated_at: candidate.updatedAt,
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
    updatedAt: toIsoString(row.updated_at),
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

function normalizeJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }

  return []
}

function toNullableNumber(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "string") {
    return value
  }

  return new Date().toISOString()
}
