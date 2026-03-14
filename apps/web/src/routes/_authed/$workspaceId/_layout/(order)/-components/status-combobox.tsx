import { useOrder } from "@/order/hooks"
import { useUpdateOrder } from "@/order/update/use-update-order"
import { useParams } from "@tanstack/react-router"
import {
   ORDER_STATUSES,
   ORDER_STATUSES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import { orderStatusGradient } from "@unfiddle/core/order/utils"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import { useTheme } from "next-themes"

export function StatusCombobox() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const order = useOrder()
   const theme = useTheme()
   const update = useUpdateOrder()

   const [from, to] = orderStatusGradient(
      order.status ?? "canceled",
      theme.resolvedTheme ?? "light",
   )

   return (
      <Combobox
         canBeEmpty
         value={order.status}
         onValueChange={(status) => {
            if (order.status === status)
               return update.mutate({
                  orderId: order.id,
                  workspaceId: params.workspaceId,
                  status: "pending",
               })

            update.mutate({
               orderId: order.id,
               workspaceId: params.workspaceId,
               status: status as never,
            })
         }}
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"ghost"}
                  className="-ml-2 w-fit justify-start gap-2.5"
               >
                  <Badge
                     className="size-3.5 shrink-0 rounded-full px-0"
                     style={{
                        background: `linear-gradient(140deg, ${from}, ${to})`,
                     }}
                  />
                  {ORDER_STATUSES_TRANSLATION[order.status] ??
                     "Без статусу"}{" "}
               </Button>
            }
         />
         <ComboboxPopup
            sideOffset={4}
            align="start"
            side="left"
         >
            <ComboboxInput />
            {ORDER_STATUSES.map((s) =>
               s === "pending" ? null : (
                  <ComboboxItem
                     key={s}
                     value={s}
                     keywords={[ORDER_STATUSES_TRANSLATION[s]]}
                  >
                     {ORDER_STATUSES_TRANSLATION[s]}
                  </ComboboxItem>
               ),
            )}
         </ComboboxPopup>
      </Combobox>
   )
}
