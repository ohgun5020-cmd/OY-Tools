import type { AdminOrderItem, PanelService } from "@/types/panel"

type IntentRule = {
  label: string
  pattern: RegExp
  quantityMultiplier: number
}

const intentRules: IntentRule[] = [
  {
    label: "조회수",
    pattern: /instagram.*(views|조회수)/i,
    quantityMultiplier: 1,
  },
  {
    label: "좋아요",
    pattern: /instagram.*(likes|좋아요)/i,
    quantityMultiplier: 1,
  },
  {
    label: "저장",
    pattern: /instagram.*(saves|저장)/i,
    quantityMultiplier: 1,
  },
]

export function buildSuggestedAdminOrderItems(services: PanelService[]) {
  const enabledInstagramServices = services.filter(
    (service) => service.isEnabled && service.platform.toLowerCase() === "instagram",
  )
  const suggestions: AdminOrderItem[] = []
  const usedServiceIds = new Set<string>()

  for (const rule of intentRules) {
    const service = enabledInstagramServices
      .filter((item) => !usedServiceIds.has(item.providerServiceId))
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.rate - b.rate)
      .find((item) => rule.pattern.test(`${item.category} ${item.name}`))

    if (!service) {
      continue
    }

    usedServiceIds.add(service.providerServiceId)
    suggestions.push({
      id: crypto.randomUUID(),
      serviceId: service.providerServiceId,
      serviceName: service.name,
      platform: service.platform,
      quantity: Math.max(service.min, Math.min(service.max, service.min * rule.quantityMultiplier)),
      rate: service.rate,
      currency: service.currency,
    })
  }

  return suggestions
}
