import type {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@unfiddle/core/order/constants"
import type { updateOrderSchema } from "@unfiddle/core/order/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type OrderItem = RouterOutput["order"]["list"][number]["items"][number]

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type OrderSeverity = (typeof ORDER_SEVERITIES)[number]

export type OrderAssignee =
   RouterOutput["order"]["list"][number]["assignees"][number]

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
        senderId: string
     }
   | {
        action: "delete_assignee"
        orderId: string
        userId: string
        senderId: string
     }
   | {
        action: "delete"
        orderId: string
        senderId: string
     }
