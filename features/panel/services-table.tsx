"use client"

import { useMemo, useState } from "react"
import { RefreshCw, Search, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/features/panel/format"
import { cn } from "@/lib/utils"
import type { PanelService } from "@/types/panel"

export function ServicesTable({ initialServices }: { initialServices: PanelService[] }) {
  const [services, setServices] = useState(initialServices)
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState("all")
  const [isSyncing, setIsSyncing] = useState(false)

  const platforms = useMemo(() => Array.from(new Set(services.map((service) => service.platform))).sort(), [services])
  const filteredServices = useMemo(() => {
    const lower = query.toLowerCase()

    return services.filter((service) => {
      const matchesPlatform = platform === "all" || service.platform === platform
      const matchesQuery = [service.providerServiceId, service.platform, service.category, service.name].some((value) =>
        value.toLowerCase().includes(lower),
      )

      return matchesPlatform && matchesQuery
    })
  }, [platform, query, services])

  async function syncServices() {
    setIsSyncing(true)
    const response = await fetch("/api/panel/services", { method: "POST" })
    const payload = (await response.json().catch(() => null)) as { services?: PanelService[] } | null
    setIsSyncing(false)

    if (response.ok && payload?.services) {
      setServices(payload.services)
    }
  }

  async function updatePreference(serviceId: string, patch: Partial<Pick<PanelService, "isFavorite" | "isEnabled">>) {
    setServices((current) =>
      current.map((service) => (service.providerServiceId === serviceId ? { ...service, ...patch } : service)),
    )

    const response = await fetch(`/api/panel/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })

    if (!response.ok) {
      setServices(initialServices)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {platforms.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="gap-2" onClick={syncServices} disabled={isSyncing}>
          <RefreshCw className={isSyncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Sync provider
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border/80">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Fav</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="min-w-[280px]">Name</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.providerServiceId}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updatePreference(service.providerServiceId, {
                        isFavorite: !service.isFavorite,
                      })
                    }
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        service.isFavorite ? "fill-amber-300 text-amber-300" : "text-muted-foreground",
                      )}
                    />
                    <span className="sr-only">Toggle favorite</span>
                  </Button>
                </TableCell>
                <TableCell className="font-mono text-xs">{service.providerServiceId}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-sm">
                    {service.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[360px] truncate font-medium">{service.name}</div>
                  <div className="max-w-[360px] truncate text-xs text-muted-foreground">{service.category}</div>
                </TableCell>
                <TableCell>{formatCurrency(service.rate, service.currency)}</TableCell>
                <TableCell>{formatNumber(service.min)}</TableCell>
                <TableCell>{formatNumber(service.max)}</TableCell>
                <TableCell>
                  <Switch
                    checked={service.isEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference(service.providerServiceId, {
                        isEnabled: checked,
                      })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
