import type { PanelOrder } from "@/types/panel"
import { formatCurrency } from "@/features/panel/format"

export function ActivityChart({ orders }: { orders: PanelOrder[] }) {
  const buckets = getDailyBuckets(orders)
  const max = Math.max(...buckets.map((bucket) => bucket.total), 1)

  return (
    <div className="grid h-64 grid-cols-7 items-end gap-3">
      {buckets.map((bucket) => (
        <div key={bucket.label} className="flex h-full min-w-0 flex-col justify-end gap-2">
          <div className="flex flex-1 items-end rounded-md border border-border/60 bg-secondary/30 p-1">
            <div
              className="w-full rounded-sm bg-primary/80 shadow-[0_0_24px_rgba(59,130,246,0.28)]"
              style={{ height: `${Math.max((bucket.total / max) * 100, bucket.count ? 12 : 3)}%` }}
              title={`${bucket.count} orders, ${formatCurrency(bucket.total)}`}
            />
          </div>
          <div className="truncate text-center text-xs text-muted-foreground">{bucket.label}</div>
        </div>
      ))}
    </div>
  )
}

function getDailyBuckets(orders: PanelOrder[]) {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" })

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)
    const next = new Date(date)
    next.setDate(date.getDate() + 1)

    const dayOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt)
      return createdAt >= date && createdAt < next
    })

    return {
      label: formatter.format(date),
      count: dayOrders.length,
      total: dayOrders.reduce((sum, order) => sum + order.charge, 0),
    }
  })
}
