import type { PanelOrderStatus } from "@/types/panel"
import { Badge } from "@/components/ui/badge"
import { statusTone } from "@/features/panel/format"
import { cn } from "@/lib/utils"

export function StatusBadge({ status }: { status: PanelOrderStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-sm", statusTone(status))}>
      {status}
    </Badge>
  )
}
