import type { OrderSeverity, OrderStatus } from "@unfiddle/core/order/types"
import type tailwindColors from "tailwindcss/colors"

type TailwindColor = keyof typeof tailwindColors

export const ORDER_STATUSES_COLORS: Record<OrderStatus, TailwindColor> = {
   pending: "stone",
   successful: "green",
   price_not_accepted: "orange",
   not_found: "blue",
   canceled: "red",
}

export const ORDER_STATUSES_TRANSLATION: Record<OrderStatus, string> = {
   pending: "Чекаємо",
   successful: "Успішно",
   price_not_accepted: "Ціна не підійшла",
   not_found: "Не знайдено",
   canceled: "Скасовано",
}

export const ORDER_SEVERITIES_TRANSLATION: Record<OrderSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
}
