import { Alert02Icon, CircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import { cn } from "@unfiddle/ui/utils"

const FILLED_ALERT =
   "fill-current [&>path+path]:stroke-background [&>path+path]:stroke-[2.5]"

const SMALL_CIRCLE = "[&>circle]:[r:8.2px]"

export function ClientSeverityIcon({
   severity,
   className = "",
}: {
   severity: OrderSeverity
   className?: string
}) {
   return severity === "critical" ? (
      <HugeiconsIcon
         icon={Alert02Icon}
         className={cn(
            FILLED_ALERT,
            "size-4.5 text-red-9 dark:text-red-10",
            className,
         )}
      />
   ) : severity === "high" ? (
      <HugeiconsIcon
         icon={Alert02Icon}
         className={cn(
            FILLED_ALERT,
            "size-4.5 text-yellow-8 dark:text-yellow-9",
            className,
         )}
      />
   ) : (
      <HugeiconsIcon
         icon={CircleIcon}
         strokeWidth={3}
         className={cn(SMALL_CIRCLE, "size-4.5 text-foreground/50", className)}
      />
   )
}
