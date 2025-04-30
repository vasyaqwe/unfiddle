import { ORDER_STATUSES_COLORS } from "@/order/constants"
import type { OrderStatus } from "@ledgerblocks/core/order/types"
import tailwindColors from "tailwindcss/colors"

export const orderStatusGradient = (status: OrderStatus) => {
   const color = ORDER_STATUSES_COLORS[status]
   if (
      !color ||
      !tailwindColors[color]?.[50] ||
      !tailwindColors[color]?.[100]
   ) {
      return []
   }

   return [tailwindColors[color][50], tailwindColors[color][100]] as const
}
