export type RuntimeMode = "demo" | "live"

export type ApiConnectionState = {
  configured: boolean
  hasApiUrl: boolean
  hasApiKey: boolean
  mode: RuntimeMode
  baseUrl: string | null
}

export type PanelBalance = {
  balance: number
  currency: string
  mode: RuntimeMode
}

export type PanelService = {
  id: string
  providerServiceId: string
  platform: string
  category: string
  name: string
  type: string
  rate: number
  min: number
  max: number
  currency: string
  isFavorite: boolean
  isEnabled: boolean
  updatedAt: string
  raw?: Record<string, unknown>
}

export type PanelOrderStatus =
  | "Pending"
  | "Processing"
  | "In progress"
  | "Completed"
  | "Partial"
  | "Canceled"
  | "Failed"

export type PanelOrder = {
  id: string
  providerOrderId: string
  platform: string
  serviceId: string
  serviceName: string
  link: string
  quantity: number
  charge: number
  currency: string
  status: PanelOrderStatus
  remains: number | null
  startCount: number | null
  createdAt: string
  updatedAt: string
}

export type CreateOrderInput = {
  serviceId: string
  link: string
  quantity: number
}

export type PanelSettings = {
  marginRate: number
  currency: string
  defaultPlatform: string
}
