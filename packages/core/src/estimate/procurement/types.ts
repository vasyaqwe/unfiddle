import type { updateEstimateProcurementSchema } from "@unfiddle/core/estimate/procurement/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type EstimateProcurement =
   RouterOutput["estimateProcurement"]["list"][number]

export type EstimateProcurementEvent =
   | {
        action: "create"
        estimateProcurement: EstimateProcurement & { estimateId: string }
        senderId: string
     }
   | {
        action: "update"
        estimateProcurement: z.infer<typeof updateEstimateProcurementSchema>
        senderId: string
     }
   | {
        action: "delete"
        estimateProcurementId: string
        estimateId: string
        senderId: string
        workspaceId: string
     }
