import Link from "next/link"
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Database, Layers3, PlusCircle, Wallet } from "lucide-react"

import { StatCard } from "@/components/app/stat-card"
import { StatusBadge } from "@/components/app/status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivityChart } from "@/features/panel/activity-chart"
import { formatCurrency, formatDateTime, formatNumber } from "@/features/panel/format"
import { demoBalance, demoOrders, demoServices } from "@/features/panel/mock-data"
import { getSmmBalance, getSmmConnectionState } from "@/lib/smm/client"
import { getPanelOrders, getPanelServices } from "@/lib/storage/panel-store"

export default async function DashboardPage() {
  const [balanceResult, ordersResult, servicesResult] = await Promise.allSettled([
    getSmmBalance(),
    getPanelOrders(),
    getPanelServices(),
  ])
  const connection = getSmmConnectionState()
  const balance = balanceResult.status === "fulfilled" ? balanceResult.value : demoBalance
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : demoOrders
  const services = servicesResult.status === "fulfilled" ? servicesResult.value : demoServices
  const warnings = [
    balanceResult.status === "rejected" ? "패널 잔액 조회에 실패했습니다. SMM_API_URL과 SMM_API_KEY를 확인하세요." : null,
    ordersResult.status === "rejected" ? "주문 저장소 조회에 실패했습니다. Railway Postgres 연결을 확인하세요." : null,
    servicesResult.status === "rejected" ? "서비스 목록 조회에 실패했습니다. DB 연결 또는 SMM 응답을 확인하세요." : null,
  ].filter(Boolean)
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
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">운영 대시보드</h1>
          <p className="mt-1 text-sm text-muted-foreground">잔액, 주문, 서비스 상태를 빠르게 확인합니다.</p>
        </div>
        <Button asChild className="gap-2 md:w-fit">
          <Link href="/orders/new">
            <PlusCircle className="h-4 w-4" />
            바로 주문
          </Link>
        </Button>
      </div>

      {warnings.length ? (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>임시 데이터로 표시 중</AlertTitle>
          <AlertDescription>{warnings.join(" ")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="패널 잔액"
          value={formatCurrency(balance.balance, balance.currency)}
          helper={connection.mode === "live" ? "실시간 API 잔액 조회" : "데모 잔액 표시"}
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          title="오늘 주문"
          value={formatNumber(todayOrders.length)}
          helper={`오늘 완료 ${completedToday}건`}
          icon={ClipboardList}
          tone="green"
        />
        <StatCard
          title="전체 주문"
          value={formatNumber(orders.length)}
          helper="DB에 저장된 주문 수"
          icon={Database}
          tone="violet"
        />
        <StatCard
          title="사용 중인 서비스"
          value={formatNumber(enabledServices)}
          helper={`불러온 서비스 ${services.length}개`}
          icon={Layers3}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card className="panel-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>최근 7일 주문 금액</CardTitle>
              <CardDescription>일별 주문 금액 흐름을 확인합니다.</CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              API {connection.configured ? "연결됨" : "설정 필요"}
            </div>
          </CardHeader>
          <CardContent>
            <ActivityChart orders={orders} />
          </CardContent>
        </Card>

        <Card className="panel-card">
          <CardHeader>
            <CardTitle>최근 주문 상태</CardTitle>
            <CardDescription>최근 생성된 주문의 처리 상태입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>주문번호</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">금액</TableHead>
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
                주문내역 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
