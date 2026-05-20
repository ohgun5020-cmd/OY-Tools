import type { PanelOrderStatus } from "@/types/panel"

export function formatCurrency(value: number, currency = "USD") {
  const absoluteValue = Math.abs(value)
  const fractionDigits =
    absoluteValue > 0 && absoluteValue < 0.01
      ? { minimumFractionDigits: 4, maximumFractionDigits: 6 }
      : absoluteValue > 0 && absoluteValue < 1
        ? { minimumFractionDigits: 2, maximumFractionDigits: 4 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...fractionDigits,
  }).format(value)
}

export function formatServiceRate(value: number, currency = "USD") {
  const needsPrecision = value === 0 || (value > 0 && value < 0.01)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: needsPrecision ? 4 : 2,
    maximumFractionDigits: needsPrecision ? 6 : 4,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function statusLabel(status: PanelOrderStatus) {
  switch (status) {
    case "Completed":
      return "완료"
    case "In progress":
      return "진행 중"
    case "Processing":
      return "처리 중"
    case "Partial":
      return "부분 완료"
    case "Canceled":
      return "취소됨"
    case "Failed":
      return "실패"
    default:
      return "대기"
  }
}

export function estimateCharge(rate: number, quantity: number, marginRate: number) {
  const base = (rate / 1000) * quantity
  return Number((base * (1 + marginRate / 100)).toFixed(6))
}

export function statusTone(status: PanelOrderStatus) {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/12 text-emerald-300 border-emerald-500/30"
    case "In progress":
    case "Processing":
      return "bg-blue-500/12 text-blue-300 border-blue-500/30"
    case "Partial":
      return "bg-amber-500/12 text-amber-300 border-amber-500/30"
    case "Canceled":
    case "Failed":
      return "bg-red-500/12 text-red-300 border-red-500/30"
    default:
      return "bg-zinc-500/12 text-zinc-300 border-zinc-500/30"
  }
}
