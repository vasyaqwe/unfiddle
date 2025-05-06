import type { OrderSeverity } from "@ledgerblocks/core/order/types"
import { cn } from "@ledgerblocks/ui/utils"

export function SeverityIcon({
   severity,
   className = "",
}: { severity: OrderSeverity; className?: string }) {
   return (
      <svg
         className={cn("w-4 shrink-0", className)}
         viewBox="0 0 22 19"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M2.25 11H3.75C4.99264 11 6 12.0074 6 13.25V16.75C6 17.9926 4.99264 19 3.75 19H2.25C1.00736 19 0 17.9926 0 16.75V13.25C0 12.0074 1.00736 11 2.25 11Z"
            fill="currentColor"
            opacity={1}
         />
         <path
            d="M10.25 5H11.75C12.9926 5 14 6.00736 14 7.25V16.75C14 17.9926 12.9926 19 11.75 19H10.25C9.00736 19 8 17.9926 8 16.75V7.25C8 6.00736 9.00736 5 10.25 5Z"
            fill="currentColor"
            opacity={severity === "medium" || severity === "high" ? 1 : 0.3}
         />
         <path
            d="M18.25 0H19.75C20.9926 0 22 1.36713 22 3.05357V15.9464C22 17.6329 20.9926 19 19.75 19H18.25C17.0074 19 16 17.6329 16 15.9464V3.05357C16 1.36713 17.0074 0 18.25 0Z"
            fill="currentColor"
            opacity={severity === "low" ? 0.3 : severity === "medium" ? 0.3 : 1}
         />
      </svg>
   )
}
