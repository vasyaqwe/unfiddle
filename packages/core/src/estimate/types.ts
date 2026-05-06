import type { updateEstimateItemSchema } from "@unfiddle/core/estimate/item/schema"
import type { EstimateItem } from "@unfiddle/core/estimate/item/types"
import type { updateEstimateMessageSchema } from "@unfiddle/core/estimate/message/zod"
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
   | {
        action: "create_item"
        item: EstimateItem
        estimateId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "update_item"
        item: z.infer<typeof updateEstimateItemSchema>
        estimateId: string
        senderId: string
     }
   | {
        action: "delete_item"
        estimateId: string
        estimateItemId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "create_message"
        message: RouterOutput["estimate"]["message"]["list"][number]
        estimateId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "update_message"
        message: z.infer<typeof updateEstimateMessageSchema>
        estimateId: string
        senderId: string
     }
   | {
        action: "delete_message"
        estimateMessageId: string
        estimateId: string
        workspaceId: string
        senderId: string
     }
