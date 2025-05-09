import { atomWithStorage } from "jotai/utils"

export const expandedOrderIdsAtom = atomWithStorage<string[]>(
   "expanded_order_ids",
   [],
)
