import type { OrderSort } from "@unfiddle/core/order/constants"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const createOrderOpenAtom = atom(false)

export const orderSortAtom = atomWithStorage<{
   sort: OrderSort
   direction: "asc" | "desc"
}>(
   "order_sort",
   {
      sort: "severity",
      direction: "desc",
   },
   undefined,
   { getOnInit: true },
)
