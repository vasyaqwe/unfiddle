import type { ProcurementStatus } from "@ledgerblocks/core/procurement/types"
import type tailwindColors from "tailwindcss/colors"

type TailwindColor = keyof typeof tailwindColors

export const PROCUREMENT_STATUSES_COLORS: Record<
   ProcurementStatus,
   TailwindColor
> = {
   pending: "stone",
   reserved: "purple",
   purchased: "green",
   awaiting_customer_reply: "yellow",
   canceled: "red",
   not_found: "gray",
   client_declined: "rose",
   awaiting_shipping: "blue",
   shipped: "emerald",
}

export const PROCUREMENT_STATUSES_TRANSLATION: Record<
   ProcurementStatus,
   string
> = {
   pending: "Чекаємо",
   reserved: "В броні",
   purchased: "Куплено",
   awaiting_customer_reply: "Очікуємо відповідь клієнта",
   canceled: "Скасовано",
   not_found: "Не знайдено",
   client_declined: "Клієнт відмовився",
   awaiting_shipping: "Відправляється",
   shipped: "Відправлено",
}
