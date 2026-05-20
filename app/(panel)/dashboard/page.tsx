import Link from "next/link"
import { ArrowRight, CheckCircle2, ClipboardList, Database, Layers3, PlusCircle, Wallet } from "lucide-react"

import { StatCard } from "@/components/app/stat-card"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivityChart } from "@/features/panel/activity-chart"
import { formatCurrency, formatDateTime, formatNumber } from "@/features/panel/format"
import { getSmmBalance, getSmmConnectionState } from "@/lib/smm/client"
import { getPanelOrders, getPanelServices } from "@/lib/storage/panel-store"

export default async function DashboardPage() {
  const [balance, orders, services] = await Promise.all([getSmmBalance(), getPanelOrders(), getPanelServices()])
  const connection = getSmmConnectionState()
  const today = new Date().toDateString()
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today)
  const recentOrders = orders.slice(0, 5)
  const enabledServices = services.filter((service) => service.isEnabled).length
  const completedToday = todayOrders.filter((order) => order.status === "Completed").length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">OY Panel</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Operations dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fast personal control for SMM balance, orders, and services.</p>
        </div>
        <Button asChild className="gap-2 md:w-fit">
          <Link href="/orders/new">
            <PlusCircle className="h-4 w-4" />
            Quick order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Panel balance"
          value={formatCurrency(balance.balance, balance.currency)}
          helper={`${connection.mode === "live" ? "Live provider" : "Demo data"} balance check`}
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          title="Orders today"
          value={formatNumber(todayOrders.length)}
          helper={`${completedToday} completed today`}
          icon={ClipboardList}
          tone="green"
        />
        <StatCard
          title="Total orders"
          value={formatNumber(orders.length)}
          helper="Stored in Supabase when configured"
          icon={Database}
          tone="violet"
        />
        <StatCard
          title="Enabled services"
          value={formatNumber(enabledServices)}
          helper={`${services.length} services loaded`}
          icon={Layers3}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card className="panel-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Order amount</CardTitle>
              <CardDescription>Tracked order value over the last 7 days.</CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              API {connection.configured ? "connected" : "ready for env"}
            </div>
          </CardHeader>
          <CardContent>
            <ActivityChart orders={orders} />
          </CardContent>
        </Card>

        <Card className="panel-card">
          <CardHeader>
            <CardTitle>Recent status</CardTitle>
            <CardDescription>Latest provider order states.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-mono text-xs">{order.providerOrderId}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(order.charge, order.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full gap-2">
              <Link href="/orders">
                View all orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
