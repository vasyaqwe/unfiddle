import type { ORDER_STATUSES } from "@ledgerblocks/core/order/constants"
import type { updateOrderSchema } from "@ledgerblocks/core/order/schema"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import type { z } from "zod"

export type OrderStatus = (typeof ORDER_STATUSES)[number]

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
        action: "delete"
        orderId: string
        senderId: string
     }
