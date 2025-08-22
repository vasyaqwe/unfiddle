import type { updateEstimateSchema } from "@unfiddle/core/estimate/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type EstimateEvent =
   | {
        action: "create"
        estimate: RouterOutput["estimate"]["list"][number]
        senderId: string
     }
   | {
        action: "update"
        estimate: z.infer<typeof updateEstimateSchema>
        senderId: string
     }
   | {
        action: "delete"
        estimateId: string
        senderId: string
        workspaceId: string
     }
