import type { ProcurementStatus } from "@unfiddle/core/procurement/types"
import type tailwindColors from "tailwindcss/colors"

export const PROCUREMENT_STATUSES = [
   "pending",
   "successful",
   "canceled",
   "price_not_accepted",
   "not_found",
] as const

type TailwindColor = keyof typeof tailwindColors

export const PROCUREMENT_STATUSES_COLORS: Record<
   ProcurementStatus,
   TailwindColor
> = {
   pending: "stone",
   successful: "green",
   price_not_accepted: "orange",
   not_found: "blue",
   canceled: "red",
}

export const PROCUREMENT_STATUSES_TRANSLATION: Record<
   ProcurementStatus,
   string
> = {
   pending: "Чекаємо",
   successful: "Успішно",
   price_not_accepted: "Ціна не підійшла",
   not_found: "Не знайдено",
   canceled: "Скасовано",
}
