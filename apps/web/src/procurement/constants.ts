import type { ProcurementStatus } from "@ledgerblocks/core/procurement/types"
import type tailwindColors from "tailwindcss/colors"

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
