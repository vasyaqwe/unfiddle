import { formatDate } from "@unfiddle/core/date"
import { ORDER_STATUSES_COLORS } from "@unfiddle/core/order/constants"
import type { OrderStatus } from "@unfiddle/core/order/types"
import tailwindColors from "tailwindcss/colors"

export const orderStatusGradient = (status: OrderStatus, theme: string) => {
   const color = ORDER_STATUSES_COLORS[status]

   const from = theme === "dark" ? 800 : 50
   const to = theme === "dark" ? 900 : 100

   if (
      !color ||
      !tailwindColors[color]?.[from] ||
      !tailwindColors[color]?.[to]
   ) {
      return []
   }

   return [tailwindColors[color][from], tailwindColors[color][to]] as const
}

export const formatOrderDate = (date: string | Date) => {
   return formatDate(
      date,
      new Date(date).getDate() === new Date().getDate()
         ? { timeStyle: "short" }
         : { dateStyle: "short" },
   )
}
