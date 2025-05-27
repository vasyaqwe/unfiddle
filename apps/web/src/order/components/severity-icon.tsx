import type { OrderSeverity } from "@unfiddle/core/order/types"
import { Icons } from "@unfiddle/ui/components/icons"
import { cn } from "@unfiddle/ui/utils"

export function SeverityIcon({
   severity,
   className = "",
}: { severity: OrderSeverity; className?: string }) {
   return severity === "high" ? (
      <Icons.alert className={cn("size-5 text-orange-9", className)} />
   ) : (
      <Icons.circle className={cn("size-5 text-foreground/50", className)} />
   )
}
