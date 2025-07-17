import { useOrderQueryOptions } from "@/order/queries"
import { expandedOrderIdsAtom } from "@/order/store"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Toggle } from "@unfiddle/ui/components/toggle"
import { cx } from "@unfiddle/ui/utils"
import { useAtom } from "jotai"

export function ToggleAll() {
   const queryOptions = useOrderQueryOptions()
   const query = useQuery(queryOptions.list)
   const data = query.data ?? []

   const orderIds = data.map((item) => item.id)
   const [expandedOrderIds, setExpandedOrderIds] = useAtom(expandedOrderIdsAtom)

   return (
      <Toggle
         pressed={
            expandedOrderIds.filter((id) => orderIds.includes(id)).length > 0
         }
         onPressedChange={(pressed) =>
            !pressed ? setExpandedOrderIds([]) : setExpandedOrderIds(orderIds)
         }
         render={(props, state) => (
            <Button
               {...props}
               variant={"ghost"}
               kind={"icon"}
               size={"sm"}
            >
               <Icons.chevronUpDuo
                  className={cx(
                     "size-6 shrink-0 text-foreground/75 transition-all duration-150",
                     state.pressed ? "rotate-180" : "",
                  )}
               />
            </Button>
         )}
      />
   )
}
