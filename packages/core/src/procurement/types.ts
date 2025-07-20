import type { PROCUREMENT_STATUSES } from "@unfiddle/core/procurement/constants"
import type { updateProcurementSchema } from "@unfiddle/core/procurement/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type ProcurementStatus = (typeof PROCUREMENT_STATUSES)[number]

export type Procurement = RouterOutput["procurement"]["list"][number]

export type ProcurementEvent =
   | {
        action: "create"
        procurement: Procurement
        orderId: string
        senderId: string
     }
   | {
        action: "update"
        procurement: z.infer<typeof updateProcurementSchema>
        orderId: string
        senderId: string
     }
   | {
        action: "delete"
        procurementId: string
        orderId: string
        senderId: string
     }
