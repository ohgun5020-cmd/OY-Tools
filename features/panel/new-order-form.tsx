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
      setError(payload?.error || "Order failed.")
      return
    }

    setCreatedOrder(payload.order)
    setLink("")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="panel-card">
        <CardHeader>
          <CardTitle>New order</CardTitle>
          <CardDescription>Create an SMM order through the server-side provider bridge.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
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
                <Label>Service</Label>
                <Select value={serviceId} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
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
              <Label htmlFor="link">Target link</Label>
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
                <Label htmlFor="quantity">Quantity</Label>
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
                <p className="text-xs text-muted-foreground">Estimated amount</p>
                <p className="mt-1 text-2xl font-semibold">{formatCurrency(estimate, selectedService?.currency)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Includes {settings.marginRate}% internal margin.</p>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Order blocked</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {createdOrder ? (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Order created</AlertTitle>
                <AlertDescription>Provider order #{createdOrder.providerOrderId} is now tracked.</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full gap-2 md:w-fit" disabled={isSubmitting || !selectedService}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              Execute order
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>Service guardrails</CardTitle>
          <CardDescription>Limits from the selected provider service.</CardDescription>
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
                  <p className="text-xs text-muted-foreground">Rate / 1K</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedService.rate, selectedService.currency)}</p>
                </div>
                <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
                  <p className="text-xs text-muted-foreground">Range</p>
                  <p className="mt-1 font-medium">
                    {formatNumber(selectedService.min)}-{formatNumber(selectedService.max)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No enabled services available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
