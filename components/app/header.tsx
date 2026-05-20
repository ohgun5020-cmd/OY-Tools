"use client"

import { Menu, Search, Shield, Wifi, WifiOff } from "lucide-react"

import { useSidebar } from "@/components/app/sidebar-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RuntimeMode } from "@/types/panel"

type HeaderProps = {
  adminEmail: string
  mode: RuntimeMode
}

export function Header({ adminEmail, mode }: HeaderProps) {
  const { toggle } = useSidebar()
  const isLive = mode === "live"

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/84 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            readOnly
            value="Command surface: orders, services, status"
            className="h-9 max-w-md border-border/70 bg-secondary/35 pl-9 text-muted-foreground"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              isLive
                ? "rounded-sm border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "rounded-sm border-amber-500/30 bg-amber-500/10 text-amber-300"
            }
          >
            {isLive ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {isLive ? "Live API" : "Demo mode"}
          </Badge>
          <div className="hidden items-center gap-2 rounded-md border border-border/70 bg-secondary/35 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <Shield className="h-3.5 w-3.5 text-primary" />
            {adminEmail}
          </div>
        </div>
      </div>
    </header>
  )
}
