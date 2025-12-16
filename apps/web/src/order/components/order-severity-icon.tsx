import type { OrderSeverity } from "@unfiddle/core/order/types"
import { Icons } from "@unfiddle/ui/components/icons"
import { cn } from "@unfiddle/ui/utils"

export function OrderSeverityIcon({
   severity,
   className = "",
}: { severity: OrderSeverity; className?: string }) {
   return severity === "critical" ? (
      <Icons.alert
         className={cn("size-5 text-red-9 dark:text-red-10", className)}
      />
   ) : severity === "high" ? (
      <Icons.alert
         className={cn("size-5 text-yellow-8 dark:text-yellow-9", className)}
      />
   ) : (
      <Icons.circle className={cn("size-5 text-foreground/50", className)} />
   )
}
