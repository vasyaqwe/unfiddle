import { z } from "zod"

export const estimateFilterSchema = z.object({
   creator: z.array(z.string()).optional(),
   q: z.string().optional(),
   startDate: z.string().optional(),
   endDate: z.string().optional(),
})
