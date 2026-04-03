import type { OrderMessage } from "@unfiddle/core/order/message/types"

export type ChatMessagePosition = "first" | "middle" | "last" | "only"
export type ChatMessage = Omit<OrderMessage, "orderId">
