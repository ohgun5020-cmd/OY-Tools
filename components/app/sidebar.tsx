"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  Gauge,
  Layers3,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { LogoutButton } from "@/components/app/logout-button"
import { useSidebar } from "@/components/app/sidebar-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Gauge },
  { name: "New Order", href: "/orders/new", icon: PlusCircle },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Services", href: "/services", icon: Layers3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle, close } = useSidebar()

  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden", isOpen ? "block" : "hidden")}
        onClick={close}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-background/96 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border/80 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold tracking-wide">OY Tools</span>
              <Badge variant="outline" className="h-5 rounded-sm border-primary/35 px-1.5 text-[10px] text-primary">
                MVP
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">OY Panel operations</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={toggle}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-2 py-4">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border/80 p-2">
          <div className="mb-2 rounded-md border border-border/70 bg-secondary/35 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Server-side API keys
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Provider credentials stay in Railway env.</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
