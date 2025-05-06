export const ORDER_STATUSES = [
   "pending",
   "successful", // Успішно, виконано
   "canceled", // Скасовано, відбій
   "failed", // Не успішно, не успішно
   "price_not_accepted", // Ціна не підійшла
   "not_found", // Не знайшли
   "awaiting_approval", // узгоджується, На узгоджені, на узгоджені
   "approved", // узгоджено
   "partially_successful", // Купили тільки 46шт
   "sent_for_payment", // Передано на оплату
] as const

export const ORDER_SEVERITIES = ["low", "high"] as const
