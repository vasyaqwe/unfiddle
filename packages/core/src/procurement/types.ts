import type { PROCUREMENT_STATUSES } from "@ledgerblocks/core/procurement/constants"

export type ProcurementStatus = (typeof PROCUREMENT_STATUSES)[number]
