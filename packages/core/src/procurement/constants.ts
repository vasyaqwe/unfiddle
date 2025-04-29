export const PROCUREMENT_STATUSES = [
   "purchased", // Купили, куплено
   "reserved", // В броні
   "canceled", // Скасовано, скасовано
   "awaiting_customer_reply", // Чекаємо відповідь від клієнта
   "not_found", // Не знайшли
   "client_declined", // Клієнт відмовився
   "awaiting_shipping", // Відправляють, відправляють
   "shipped", // Відправили, відправлено
] as const
