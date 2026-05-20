import { formatNumber, formatServiceRate } from "@/features/panel/format"
import { getServiceDisplay } from "@/features/panel/service-display"
import type { PanelService } from "@/types/panel"

export function getServiceCategoryOptions(services: PanelService[]) {
  return Array.from(new Set(services.map((service) => getServiceDisplay(service).category))).sort()
}

export function getServiceOptionLabel(service: PanelService) {
  const display = getServiceDisplay(service)
  return `${display.name} · 1K ${formatServiceRate(service.rate, service.currency)} · ${formatNumber(service.min)}-${formatNumber(service.max)}`
}

export function findFirstServiceByCategory(services: PanelService[], category: string) {
  if (category === "all") {
    return services[0]
  }

  return services.find((service) => getServiceDisplay(service).category === category)
}
