import type { OrderSeverity, OrderStatus } from "@unfiddle/core/order/types"
import type tailwindColors from "tailwindcss/colors"

export const ORDER_STATUSES = [
   "pending",
   "processing",
   "en_route",
   "successful",
   "canceled",
] as const

export const ORDER_SEVERITIES = ["low", "high", "critical"] as const

type TailwindColor = keyof typeof tailwindColors

export const ORDER_STATUSES_COLORS: Record<OrderStatus, TailwindColor> = {
   pending: "stone",
   processing: "blue",
   en_route: "orange",
   successful: "green",
   canceled: "red",
}

export const ORDER_STATUSES_TRANSLATION: Record<OrderStatus, string> = {
   pending: "Без статусу",
   processing: "В роботі",
   en_route: "В дорозі",
   successful: "Успішно",
   canceled: "Скасовано",
}

export const ORDER_SEVERITIES_TRANSLATION: Record<OrderSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
   critical: "Критично",
}
