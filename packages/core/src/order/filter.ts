import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import { z } from "zod"

export const orderFilterSchema = z.object({
   status: z.array(z.enum(ORDER_STATUSES)).optional(),
   severity: z.array(z.enum(ORDER_SEVERITIES)).optional(),
   creator: z.array(z.string()).optional(),
   client: z.array(z.string()).optional(),
   q: z.string().optional(),
   archived: z.boolean().optional(),
   startDate: z.string().optional(),
   endDate: z.string().optional(),
})
