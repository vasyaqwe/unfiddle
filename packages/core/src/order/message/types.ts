import type { updateOrderMessageSchema } from "@unfiddle/core/order/message/schema"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import type { z } from "zod"

export type OrderMessage = RouterOutput["order"]["message"]["list"][number]
export type OrderMessagePosition = "first" | "middle" | "last" | "only"

export type OrderMessageUpdate = z.infer<typeof updateOrderMessageSchema>
