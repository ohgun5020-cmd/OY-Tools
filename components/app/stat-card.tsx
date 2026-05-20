import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: LucideIcon
  tone?: "blue" | "green" | "violet" | "amber"
}

const tones = {
  blue: "bg-blue-500/12 text-blue-300 border-blue-500/25",
  green: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  violet: "bg-violet-500/12 text-violet-300 border-violet-500/25",
  amber: "bg-amber-500/12 text-amber-300 border-amber-500/25",
}

export function StatCard({ title, value, helper, icon: Icon, tone = "blue" }: StatCardProps) {
  return (
    <Card className="panel-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md border", tones[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}
