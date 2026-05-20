import type { PanelBalance, PanelOrder, PanelService, PanelSettings } from "@/types/panel"

export const defaultPanelSettings: PanelSettings = {
  marginRate: 12,
  currency: "USD",
  defaultPlatform: "Instagram",
}

export const demoBalance: PanelBalance = {
  balance: 428.72,
  currency: "USD",
  mode: "demo",
}

export const demoServices: PanelService[] = [
  {
    id: "101",
    providerServiceId: "101",
    platform: "Instagram",
    category: "Instagram Followers",
    name: "Instagram Followers - HQ drip",
    type: "Default",
    rate: 2.8,
    min: 50,
    max: 20000,
    currency: "USD",
    isFavorite: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "144",
    providerServiceId: "144",
    platform: "Instagram",
    category: "Instagram Likes",
    name: "Instagram Likes - fast start",
    type: "Default",
    rate: 0.42,
    min: 10,
    max: 50000,
    currency: "USD",
    isFavorite: true,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "220",
    providerServiceId: "220",
    platform: "TikTok",
    category: "TikTok Views",
    name: "TikTok Views - stable",
    type: "Default",
    rate: 0.08,
    min: 100,
    max: 1000000,
    currency: "USD",
    isFavorite: false,
    isEnabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "310",
    providerServiceId: "310",
    platform: "YouTube",
    category: "YouTube Subscribers",
    name: "YouTube Subscribers - refill 30d",
    type: "Default",
    rate: 11.5,
    min: 25,
    max: 5000,
    currency: "USD",
    isFavorite: false,
    isEnabled: false,
    updatedAt: new Date().toISOString(),
  },
]

export const demoOrders: PanelOrder[] = [
  {
    id: "demo-1004",
    providerOrderId: "91004",
    platform: "Instagram",
    serviceId: "144",
    serviceName: "Instagram Likes - fast start",
    link: "https://instagram.com/p/demo-post",
    quantity: 1200,
    charge: 0.56,
    currency: "USD",
    status: "Completed",
    remains: 0,
    startCount: 843,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "demo-1003",
    providerOrderId: "91003",
    platform: "TikTok",
    serviceId: "220",
    serviceName: "TikTok Views - stable",
    link: "https://tiktok.com/@oy/video/demo",
    quantity: 25000,
    charge: 2.24,
    currency: "USD",
    status: "In progress",
    remains: 8200,
    startCount: 1204,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "demo-1002",
    providerOrderId: "91002",
    platform: "Instagram",
    serviceId: "101",
    serviceName: "Instagram Followers - HQ drip",
    link: "https://instagram.com/oy.tools",
    quantity: 500,
    charge: 1.57,
    currency: "USD",
    status: "Processing",
    remains: 500,
    startCount: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
]

export function getDemoStatus(orderId: string) {
  const statusPool = ["Processing", "In progress", "Completed"] as const
  const index = Math.abs(
    orderId.split("").reduce((total, char) => total + char.charCodeAt(0), 0),
  ) % statusPool.length

  return {
    status: statusPool[index],
    charge: 0,
    remains: index === 2 ? 0 : 100,
    start_count: 1200 + index * 88,
    currency: "USD",
  }
}
