import type { OrderSeverity, OrderStatus } from "@unfiddle/core/order/types"
import type tailwindColors from "tailwindcss/colors"

export const ORDER_STATUSES = [
   "pending",
   "processing",
   "successful",
   "canceled",
] as const

export const ORDER_SEVERITIES = ["low", "high", "critical"] as const

type TailwindColor = keyof typeof tailwindColors

export const ORDER_STATUSES_COLORS: Record<OrderStatus, TailwindColor> = {
   pending: "stone",
   successful: "green",
   processing: "blue",
   canceled: "red",
}

export const ORDER_STATUSES_TRANSLATION: Record<OrderStatus, string> = {
   pending: "В дорозі",
   successful: "Успішно",
   processing: "В роботі",
   canceled: "Скасовано",
}

export const ORDER_SEVERITIES_TRANSLATION: Record<OrderSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
   critical: "Критично",
}
