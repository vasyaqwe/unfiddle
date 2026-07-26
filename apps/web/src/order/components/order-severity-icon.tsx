import { Alert02Icon, CircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import { cn } from "@unfiddle/ui/utils"

export function OrderSeverityIcon({
   severity,
   className = "",
}: {
   severity: OrderSeverity
   className?: string
}) {
   return severity === "critical" ? (
      <HugeiconsIcon
         icon={Alert02Icon}
         className={cn("size-5 text-red-9 dark:text-red-10", className)}
      />
   ) : severity === "high" ? (
      <HugeiconsIcon
         icon={Alert02Icon}
         className={cn("size-5 text-yellow-8 dark:text-yellow-9", className)}
      />
   ) : (
      <HugeiconsIcon
         icon={CircleIcon}
         className={cn("size-5 text-foreground/50", className)}
      />
   )
}
