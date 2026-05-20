"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Loader2, SendHorizontal } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { estimateCharge, formatCurrency, formatNumber } from "@/features/panel/format"
import type { PanelOrder, PanelService, PanelSettings } from "@/types/panel"

type NewOrderFormProps = {
  services: PanelService[]
  settings: PanelSettings
}

export function NewOrderForm({ services, settings }: NewOrderFormProps) {
  const enabledServices = useMemo(() => services.filter((service) => service.isEnabled), [services])
  const platforms = useMemo(
    () => Array.from(new Set(enabledServices.map((service) => service.platform))).sort(),
    [enabledServices],
  )
  const [platform, setPlatform] = useState(settings.defaultPlatform || platforms[0] || "Instagram")
  const platformServices = enabledServices.filter((service) => service.platform === platform)
  const [serviceId, setServiceId] = useState(platformServices[0]?.providerServiceId || enabledServices[0]?.providerServiceId || "")
  const selectedService =
    enabledServices.find((service) => service.providerServiceId === serviceId) || platformServices[0] || enabledServices[0]
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(selectedService?.min || 100)
  const [error, setError] = useState("")
  const [createdOrder, setCreatedOrder] = useState<PanelOrder | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const estimate = selectedService ? estimateCharge(selectedService.rate, quantity, settings.marginRate) : 0

  function handlePlatformChange(value: string) {
    setPlatform(value)
    const nextService = enabledServices.find((service) => service.platform === value)
    if (nextService) {
      setServiceId(nextService.providerServiceId)
      setQuantity(nextService.min)
    }
  }

  function handleServiceChange(value: string) {
    setServiceId(value)
    const nextService = enabledServices.find((service) => service.providerServiceId === value)
    if (nextService) {
      setQuantity(nextService.min)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setCreatedOrder(null)
    setIsSubmitting(true)

    const response = await fetch("/api/panel/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId,
        link,
        quantity,
      }),
    })

    setIsSubmitting(false)

    const payload = (await response.json().catch(() => null)) as { order?: PanelOrder; error?: string } | null

    if (!response.ok || !payload?.order) {
      setError(payload?.error || "주문 실행에 실패했습니다.")
      return
    }

    setCreatedOrder(payload.order)
    setLink("")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="panel-card">
        <CardHeader>
          <CardTitle>주문 입력</CardTitle>
          <CardDescription>API 키는 서버에서만 사용되고, 여기서는 주문값만 입력합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>플랫폼</Label>
                <Select value={platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="플랫폼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>서비스</Label>
                <Select value={serviceId} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="서비스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformServices.map((service) => (
                      <SelectItem key={service.providerServiceId} value={service.providerServiceId}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">주문 링크</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(event) => setLink(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={selectedService?.min || 1}
                  max={selectedService?.max || undefined}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  required
                />
              </div>

              <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
                <p className="text-xs text-muted-foreground">예상 금액</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(estimate, selectedService?.currency)}</p>
                <p className="mt-1 text-xs text-muted-foreground">내부 계산 마진 {settings.marginRate}% 포함</p>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>주문 실행 불가</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {createdOrder ? (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>주문 생성 완료</AlertTitle>
                <AlertDescription>외부 주문번호 #{createdOrder.providerOrderId}를 추적합니다.</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full gap-2 md:w-fit" disabled={isSubmitting || !selectedService}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              주문 실행
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>서비스 기준</CardTitle>
          <CardDescription>선택한 서비스의 단가와 주문 가능 수량입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedService ? (
            <>
              <div>
                <p className="text-sm font-medium">{selectedService.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{selectedService.category}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
                  <p className="text-xs text-muted-foreground">1,000개 단가</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedService.rate, selectedService.currency)}</p>
                </div>
                <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
                  <p className="text-xs text-muted-foreground">수량 범위</p>
                  <p className="mt-1 font-medium">
                    {formatNumber(selectedService.min)}-{formatNumber(selectedService.max)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">사용 가능한 서비스가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
