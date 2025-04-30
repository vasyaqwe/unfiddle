import { PROCUREMENT_STATUSES_COLORS } from "@/procurement/constants"
import type { ProcurementStatus } from "@ledgerblocks/core/procurement/types"
import tailwindColors from "tailwindcss/colors"

export const procurementStatusGradient = (status: ProcurementStatus) => {
   const color = PROCUREMENT_STATUSES_COLORS[status]
   if (
      !color ||
      !tailwindColors[color]?.[50] ||
      !tailwindColors[color]?.[100]
   ) {
      return []
   }

   return [tailwindColors[color][50], tailwindColors[color][100]] as const
}
