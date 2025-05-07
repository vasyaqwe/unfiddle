import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@ledgerblocks/core/order/constants"
import { z } from "zod"

export const orderFilterSchema = z.object({
   status: z.array(z.enum(ORDER_STATUSES)).optional(),
   severity: z.array(z.enum(ORDER_SEVERITIES)).optional(),
   q: z.string().optional(),
   archived: z.boolean().optional(),
})
