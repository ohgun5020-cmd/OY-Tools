"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Bot, CheckCircle2, Clock3, Loader2, Play, PlusCircle, RefreshCw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime, formatNumber, formatServiceRate } from "@/features/panel/format"
import { getServiceDisplay, translateServiceName } from "@/features/panel/service-display"
import type { AdminOrderCandidate, AdminOrderStatus, PanelOrder, PanelService } from "@/types/panel"

type AdminOrderConsoleProps = {
  initialCandidates: AdminOrderCandidate[]
  services: PanelService[]
  instagramConnection: {
    configured: boolean
    hasUserId: boolean
    hasAccessToken: boolean
    profileUrl: string
    username: string
  }
}

type ApiPayload = {
  candidate?: AdminOrderCandidate
  candidates?: AdminOrderCandidate[]
  orders?: PanelOrder[]
  created?: boolean
  message?: string
  error?: string
  required?: string[]
}

export function AdminOrderConsole({ initialCandidates, services, instagramConnection }: AdminOrderConsoleProps) {
  const enabledServices = useMemo(
    () => services.filter((service) => service.isEnabled && service.platform.toLowerCase() === "instagram"),
    [services],
  )
  const [candidates, setCandidates] = useState(initialCandidates)
  const [targetUrl, setTargetUrl] = useState("")
  const [serviceId, setServiceId] = useState(enabledServices[0]?.providerServiceId || "")
  const selectedService = enabledServices.find((service) => service.providerServiceId === serviceId) || enabledServices[0]
  const [quantity, setQuantity] = useState(selectedService?.min || 100)
  const [isScanning, setIsScanning] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  function handleServiceChange(value: string) {
    const nextService = enabledServices.find((service) => service.providerServiceId === value)
    setServiceId(value)
    setQuantity(nextService?.min || 100)
  }

  async function scanLatestPost() {
    setIsScanning(true)
    setNotice("")
    setError("")

    const response = await fetch("/api/panel/admin-orders/scan", { method: "POST" })
    const payload = (await response.json().catch(() => null)) as ApiPayload | null

    setIsScanning(false)

    if (!response.ok || !payload?.candidate) {
      const required = payload?.required?.length ? ` 필요한 변수: ${payload.required.join(", ")}` : ""
      setError((payload?.error || "새 게시글 확인에 실패했습니다.") + required)
      return
    }

    setCandidates((current) => upsertCandidate(current, payload.candidate!))
    setNotice(payload.message || "관리자 오더 후보를 갱신했습니다.")
  }

  async function createManualCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)
    setNotice("")
    setError("")

    const response = await fetch("/api/panel/admin-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetUrl,
        serviceId,
        quantity,
      }),
    })
    const payload = (await response.json().catch(() => null)) as ApiPayload | null

    setIsCreating(false)

    if (!response.ok || !payload?.candidate) {
      setError(payload?.error || "관리자 오더 후보 생성에 실패했습니다.")
      return
    }

    setCandidates((current) => [payload.candidate!, ...current])
    setTargetUrl("")
    setNotice("수동 관리자 오더 후보를 만들었습니다. 확인 후 실행 버튼을 누르면 실제 주문이 들어갑니다.")
  }

  async function executeCandidate(candidate: AdminOrderCandidate) {
    const ok = window.confirm("이 후보의 항목을 실제 SMM 주문으로 실행할까요? 실행하면 패널 잔액이 차감될 수 있습니다.")

    if (!ok) {
      return
    }

    setExecutingId(candidate.id)
    setNotice("")
    setError("")

    const response = await fetch(`/api/panel/admin-orders/${candidate.id}/execute`, { method: "POST" })
    const payload = (await response.json().catch(() => null)) as ApiPayload | null

    setExecutingId(null)

    if (!response.ok || !payload?.candidate) {
      setError(payload?.error || "관리자 오더 실행에 실패했습니다.")
      return
    }

    setCandidates((current) => current.map((item) => (item.id === payload.candidate!.id ? payload.candidate! : item)))
    setNotice(`실제 주문 ${payload.orders?.length || 0}건을 생성했습니다.`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">승인형 자동화</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">관리자 오더</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          새 게시글을 확인해 주문 후보를 만들고, 직접 승인한 항목만 실제 SMM 주문으로 실행합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Instagram 감지"
          value={instagramConnection.configured ? "실행 가능" : "변수 필요"}
          description={
            instagramConnection.configured
              ? "공식 API 토큰으로 최신 게시글을 확인합니다."
              : "Railway Variables에 Instagram API 값을 넣어야 합니다."
          }
          icon={Clock3}
          tone={instagramConnection.configured ? "ok" : "warn"}
        />
        <StatusCard
          title="오더 큐"
          value="작동 중"
          description="후보 생성과 승인 실행은 현재 페이지에서 처리합니다."
          icon={Bot}
          tone="ok"
        />
        <StatusCard
          title="실제 주문"
          value="수동 승인"
          description="자동 실행 대신 버튼 클릭 후 주문을 넣습니다."
          icon={CheckCircle2}
          tone="info"
        />
      </div>

      <Card className="panel-card">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>감지 대상</CardTitle>
              <CardDescription>현재 연결하려는 Instagram 프로필입니다.</CardDescription>
            </div>
            <Button className="gap-2" onClick={scanLatestPost} disabled={isScanning}>
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              새 게시글 확인
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border/70 bg-secondary/35 p-4">
            <p className="text-xs text-muted-foreground">Profile URL</p>
            <p className="mt-1 break-all font-mono text-sm">{instagramConnection.profileUrl}</p>
          </div>
          {!instagramConnection.configured ? (
            <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>아직 자동 감지는 꺼져 있습니다</AlertTitle>
              <AlertDescription>
                `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`을 Railway Variables에 넣으면 이 버튼으로 최신 게시글을
                확인할 수 있습니다. 그 전에는 아래 수동 후보 추가로 구동하면 됩니다.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>수동 후보 추가</CardTitle>
          <CardDescription>게시글 URL과 서비스를 골라 검토 큐에 먼저 올립니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_140px_auto]" onSubmit={createManualCandidate}>
            <div className="grid gap-2">
              <Label htmlFor="admin-target-url">게시글 URL</Label>
              <Input
                id="admin-target-url"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>서비스</Label>
              <Select value={serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="서비스 선택" />
                </SelectTrigger>
                <SelectContent>
                  {enabledServices.map((service) => (
                    <SelectItem
                      key={service.providerServiceId}
                      value={service.providerServiceId}
                      className="min-h-10 whitespace-normal leading-5"
                    >
                      {getServiceDisplay(service).name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-quantity">수량</Label>
              <Input
                id="admin-quantity"
                type="number"
                min={selectedService?.min || 1}
                max={selectedService?.max || undefined}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full gap-2" disabled={isCreating || !selectedService}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                후보 추가
              </Button>
            </div>
          </form>
          {selectedService ? (
            <p className="mt-3 text-xs text-muted-foreground">
              선택 서비스: {getServiceDisplay(selectedService).name} · 1K 단가{" "}
              {formatServiceRate(selectedService.rate, selectedService.currency)} · 수량 {formatNumber(selectedService.min)}-
              {formatNumber(selectedService.max)}
            </p>
          ) : (
            <p className="mt-3 text-xs text-amber-200">사용 가능한 Instagram 서비스가 없습니다. 서비스 목록에서 동기화/활성화를 먼저 해주세요.</p>
          )}
        </CardContent>
      </Card>

      {notice ? (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>처리 완료</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>처리 불가</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>관리자 오더 큐</CardTitle>
          <CardDescription>후보를 검토하고 필요한 항목만 실제 주문으로 실행합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border/80">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>상태</TableHead>
                  <TableHead className="min-w-[260px]">게시글</TableHead>
                  <TableHead>출처</TableHead>
                  <TableHead className="min-w-[300px]">주문 후보</TableHead>
                  <TableHead>감지일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.length ? (
                  candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <AdminOrderStatusBadge status={candidate.status} />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[360px] truncate font-mono text-xs">{candidate.targetUrl}</div>
                        {candidate.caption ? (
                          <div className="mt-1 max-w-[360px] truncate text-xs text-muted-foreground">{candidate.caption}</div>
                        ) : null}
                        {candidate.errorMessage ? (
                          <div className="mt-1 max-w-[360px] truncate text-xs text-red-300">{candidate.errorMessage}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>{candidate.source === "instagram" ? "Instagram 감지" : "수동 추가"}</TableCell>
                      <TableCell>
                        {candidate.items.length ? (
                          <div className="space-y-1">
                            {candidate.items.map((item) => (
                              <div key={item.id} className="text-sm">
                                {translateServiceName(item.serviceName)}
                                <span className="ml-2 text-xs text-muted-foreground">{formatNumber(item.quantity)}개</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-amber-200">추천 서비스 없음</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(candidate.detectedAt || candidate.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => executeCandidate(candidate)}
                          disabled={candidate.status === "Executed" || !candidate.items.length || executingId === candidate.id}
                        >
                          {executingId === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          주문 실행
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      아직 관리자 오더 후보가 없습니다. 새 게시글 확인 또는 수동 후보 추가로 시작하세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  description: string
  icon: typeof Clock3
  tone: "ok" | "warn" | "info"
}) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-500/30 text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/30 text-amber-300"
        : "border-primary/30 text-primary"

  return (
    <Card className="panel-card">
      <CardHeader className="space-y-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md border bg-secondary/45 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-1 text-xl">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function AdminOrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  const labels: Record<AdminOrderStatus, string> = {
    Review: "검토 대기",
    Executed: "실행 완료",
    Rejected: "제외됨",
    Failed: "실패",
  }
  const className =
    status === "Executed"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : status === "Failed"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : status === "Rejected"
          ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
          : "border-blue-500/30 bg-blue-500/10 text-blue-300"

  return (
    <Badge variant="outline" className={`whitespace-nowrap rounded-sm ${className}`}>
      {labels[status]}
    </Badge>
  )
}

function upsertCandidate(candidates: AdminOrderCandidate[], candidate: AdminOrderCandidate) {
  const index = candidates.findIndex((item) => item.id === candidate.id)

  if (index === -1) {
    return [candidate, ...candidates]
  }

  return candidates.map((item) => (item.id === candidate.id ? candidate : item))
}
