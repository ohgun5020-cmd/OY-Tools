"use client"

import { useMemo, useState } from "react"
import { RefreshCw, Search } from "lucide-react"

import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime, formatNumber } from "@/features/panel/format"
import type { PanelOrder } from "@/types/panel"

export function OrdersTable({ initialOrders }: { initialOrders: PanelOrder[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [query, setQuery] = useState("")
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    const lower = query.toLowerCase()

    return orders.filter((order) =>
      [order.providerOrderId, order.platform, order.serviceName, order.link, order.status].some((value) =>
        value.toLowerCase().includes(lower),
      ),
    )
  }, [orders, query])

  async function refreshStatus(id: string) {
    setRefreshingId(id)
    const response = await fetch(`/api/panel/orders/${id}/refresh`, { method: "POST" })
    const payload = (await response.json().catch(() => null)) as { order?: PanelOrder } | null
    setRefreshingId(null)

    if (response.ok && payload?.order) {
      setOrders((current) => current.map((order) => (order.id === id ? payload.order! : order)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-border/80">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="min-w-[220px]">Service</TableHead>
              <TableHead className="min-w-[260px]">Link</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.providerOrderId}</TableCell>
                <TableCell>{order.platform}</TableCell>
                <TableCell className="max-w-[260px] truncate">{order.serviceName}</TableCell>
                <TableCell className="max-w-[320px] truncate text-muted-foreground">{order.link}</TableCell>
                <TableCell>{formatNumber(order.quantity)}</TableCell>
                <TableCell>{formatCurrency(order.charge, order.currency)}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refreshStatus(order.id)}
                    disabled={refreshingId === order.id}
                  >
                    <RefreshCw className={refreshingId === order.id ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    <span className="sr-only">Refresh status</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
