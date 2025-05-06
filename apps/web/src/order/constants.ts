import type { OrderSeverity, OrderStatus } from "@ledgerblocks/core/order/types"
import type tailwindColors from "tailwindcss/colors"

type TailwindColor = keyof typeof tailwindColors

export const ORDER_STATUSES_COLORS: Record<OrderStatus, TailwindColor> = {
   pending: "stone",
   successful: "green",
   price_not_accepted: "orange",
   not_found: "gray",
   awaiting_approval: "yellow",
   approved: "blue",
   canceled: "red",
   failed: "rose",
   partially_successful: "emerald",
   sent_for_payment: "indigo",
}

export const ORDER_STATUSES_TRANSLATION: Record<OrderStatus, string> = {
   pending: "Чекаємо",
   successful: "Успішно",
   price_not_accepted: "Ціна не підійшла",
   not_found: "Не знайдено",
   awaiting_approval: "Очікує узгодження",
   approved: "Узгоджено",
   canceled: "Скасовано",
   failed: "Неуспішно",
   partially_successful: "Частково виконано",
   sent_for_payment: "Передано на оплату",
}

export const ORDER_SEVERITIES_TRANSLATION: Record<OrderSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
}
