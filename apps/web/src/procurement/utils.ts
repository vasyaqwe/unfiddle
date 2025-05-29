import { PROCUREMENT_STATUSES_COLORS } from "@/procurement/constants"
import type { ProcurementStatus } from "@unfiddle/core/procurement/types"
import tailwindColors from "tailwindcss/colors"

export const procurementStatusGradient = (
   status: ProcurementStatus,
   theme: string,
) => {
   const color = PROCUREMENT_STATUSES_COLORS[status]

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
