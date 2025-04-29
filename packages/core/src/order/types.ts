import type { ORDER_STATUSES } from "@ledgerblocks/core/order/constants"

export type OrderStatus = (typeof ORDER_STATUSES)[number]
