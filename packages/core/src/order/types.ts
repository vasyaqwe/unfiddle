import type { updateOrderItemSchema } from "@unfiddle/core/database/schema"
import type { OrderAssignee } from "@unfiddle/core/order/assignee/types"
import type {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import type { updateOrderSchema } from "@unfiddle/core/order/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type OrderSeverity = (typeof ORDER_SEVERITIES)[number]

export type OrderEvent =
   | {
        action: "create"
        order: RouterOutput["order"]["list"][number]
        senderId: string
     }
   | {
        action: "update"
        order: z.infer<typeof updateOrderSchema>
        senderId: string
     }
   | {
        action: "create_assignee"
        assignee: OrderAssignee
        orderId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "delete_assignee"
        orderId: string
        userId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "create_item"
        item: OrderItem
        orderId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "update_item"
        item: z.infer<typeof updateOrderItemSchema>
        orderId: string
        senderId: string
     }
   | {
        action: "delete_item"
        orderId: string
        orderItemId: string
        workspaceId: string
        senderId: string
     }
   | {
        action: "delete"
        orderId: string
        senderId: string
        workspaceId: string
     }
