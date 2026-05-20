import type { ApiConnectionState, CreateOrderInput, PanelBalance, PanelOrderStatus, PanelService } from "@/types/panel"
import { demoBalance, demoServices, getDemoStatus } from "@/features/panel/mock-data"

type SmmServiceResponse = {
  service: string | number
  name: string
  type?: string
  category?: string
  rate?: string | number
  price?: string | number
  cost?: string | number
  price_per_1000?: string | number
  rate_per_1000?: string | number
  min?: string | number
  minimum?: string | number
  min_order?: string | number
  min_quantity?: string | number
  max?: string | number
  maximum?: string | number
  max_order?: string | number
  max_quantity?: string | number
  refill?: boolean
  cancel?: boolean
  [key: string]: unknown
}

type SmmStatusResponse = {
  status?: string
  charge?: string | number
  remains?: string | number
  start_count?: string | number
  currency?: string
  error?: string
}

export function getSmmConnectionState(): ApiConnectionState {
  const baseUrl = process.env.SMM_API_URL || null
  const hasApiKey = Boolean(process.env.SMM_API_KEY)
  const hasApiUrl = Boolean(baseUrl)

  return {
    configured: hasApiUrl && hasApiKey,
    hasApiUrl,
    hasApiKey,
    mode: hasApiUrl && hasApiKey ? "live" : "demo",
    baseUrl,
  }
}

export async function getSmmBalance(): Promise<PanelBalance> {
  if (!isLiveMode()) {
    return demoBalance
  }

  const response = await callSmmApi<{ balance: string | number; currency?: string; error?: string }>({
    action: "balance",
  })

  return {
    balance: toNumber(response.balance),
    currency: response.currency || process.env.SMM_CURRENCY || "USD",
    mode: "live",
  }
}

export async function listSmmServices(): Promise<PanelService[]> {
  if (!isLiveMode()) {
    return demoServices
  }

  const response = await callSmmApi<SmmServiceResponse[]>({
    action: "services",
  })

  return response.map(mapSmmService)
}

export async function createSmmOrder(input: CreateOrderInput) {
  if (!isLiveMode()) {
    return {
      providerOrderId: String(Math.floor(90000 + Math.random() * 9999)),
    }
  }

  const response = await callSmmApi<{ order?: string | number; error?: string }>({
    action: "add",
    service: input.serviceId,
    link: input.link,
    quantity: String(input.quantity),
  })

  if (!response.order) {
    throw new Error("외부 패널에서 주문번호를 반환하지 않았습니다.")
  }

  return {
    providerOrderId: String(response.order),
  }
}

export async function getSmmOrderStatus(providerOrderId: string) {
  if (!isLiveMode()) {
    return getDemoStatus(providerOrderId)
  }

  return callSmmApi<SmmStatusResponse>({
    action: "status",
    order: providerOrderId,
  })
}

function isLiveMode() {
  return getSmmConnectionState().configured
}

async function callSmmApi<T>(params: Record<string, string>) {
  const url = process.env.SMM_API_URL
  const key = process.env.SMM_API_KEY

  if (!url || !key) {
    throw new Error("실 API 호출에는 SMM_API_URL과 SMM_API_KEY가 필요합니다.")
  }

  const body = new URLSearchParams({
    key,
    ...params,
  })

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  const json = (await response.json()) as T & { error?: string }

  if (!response.ok || json.error) {
    throw new Error(json.error || `외부 패널 요청에 실패했습니다. 상태 코드: ${response.status}`)
  }

  return json
}

function mapSmmService(service: SmmServiceResponse): PanelService {
  const category = service.category || "Uncategorized"
  const id = String(service.service)
  const rate = firstNumber(service.rate, service.price, service.cost, service.price_per_1000, service.rate_per_1000)
  const min = firstNumber(service.min, service.minimum, service.min_order, service.min_quantity)
  const max = firstNumber(service.max, service.maximum, service.max_order, service.max_quantity)

  return {
    id,
    providerServiceId: id,
    platform: detectPlatform(`${category} ${service.name}`),
    category,
    name: service.name,
    type: service.type || "Default",
    rate,
    min,
    max,
    currency: process.env.SMM_CURRENCY || "USD",
    isFavorite: false,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
    raw: service as Record<string, unknown>,
  }
}

export function normalizeStatus(value: string | undefined): PanelOrderStatus {
  const normalized = (value || "Pending").trim().toLowerCase()

  if (normalized.includes("complete")) return "Completed"
  if (normalized.includes("progress")) return "In progress"
  if (normalized.includes("process")) return "Processing"
  if (normalized.includes("partial")) return "Partial"
  if (normalized.includes("cancel")) return "Canceled"
  if (normalized.includes("fail")) return "Failed"

  return "Pending"
}

function detectPlatform(value: string) {
  const lower = value.toLowerCase()

  if (lower.includes("instagram")) return "Instagram"
  if (lower.includes("tiktok")) return "TikTok"
  if (lower.includes("youtube")) return "YouTube"
  if (lower.includes("facebook")) return "Facebook"
  if (lower.includes("twitter") || lower.includes("x ")) return "X"
  if (lower.includes("telegram")) return "Telegram"

  return "Other"
}

function toNumber(value: string | number | undefined | null) {
  const normalized =
    typeof value === "string"
      ? value.replace(/,/g, "").replace(/[^\d.-]/g, "")
      : value
  const parsed = Number(normalized ?? 0)

  return Number.isFinite(parsed) ? parsed : 0
}

function firstNumber(...values: Array<string | number | undefined | null>) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return toNumber(value)
    }
  }

  return 0
}
