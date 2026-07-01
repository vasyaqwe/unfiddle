import type {
   OrderPaymentType,
   OrderSeverity,
   OrderStatus,
} from "@unfiddle/core/order/types"
import type tailwindColors from "tailwindcss/colors"

export const ORDER_STATUSES = [
   "pending",
   "processing",
   "en_route",
   "successful",
   "canceled",
] as const

export const ORDER_SEVERITIES = ["low", "high", "critical"] as const

export const CRM_ORDER_URL_PREFIX =
   "https://luckyskyforce.keycrm.app/app/orders/"

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
   en_route: "Некоректний запит",
   successful: "Успішно",
   canceled: "Скасовано",
}

export const ORDER_SEVERITIES_TRANSLATION: Record<OrderSeverity, string> = {
   low: "Звичайно",
   high: "Терміново",
   critical: "Критично",
}

// Sort weight: critical first, then high, then low.
export const ORDER_SEVERITY_RANK: Record<OrderSeverity, number> = {
   critical: 0,
   high: 1,
   low: 2,
}

export const ORDER_PAYMENT_TYPES = [
   "llc_no_vat",
   "llc_vat",
   "fop",
   "cash",
] as const

export const ORDER_PAYMENT_TYPES_TRANSLATION: Record<OrderPaymentType, string> =
   {
      llc_no_vat: "ТОВ без ПДВ",
      llc_vat: "ТОВ з ПДВ",
      fop: "ФОП",
      cash: "Готівка",
   }
