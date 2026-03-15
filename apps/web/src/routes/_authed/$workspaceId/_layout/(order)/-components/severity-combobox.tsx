import { OrderSeverityIcon } from "@/order/components/order-severity-icon"
import { useOrder } from "@/order/hooks"
import { useUpdateOrder } from "@/order/update/use-update-order"
import { useParams } from "@tanstack/react-router"
import {
   ORDER_SEVERITIES,
   ORDER_SEVERITIES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import { Button } from "@unfiddle/ui/components/button"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import { cn } from "@unfiddle/ui/utils"

export function SeverityCombobox({
   className,
}: React.ComponentProps<typeof Button>) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })

   const order = useOrder()
   const update = useUpdateOrder()

   return (
      <Combobox
         value={order.severity}
         onValueChange={(severity) => {
            update.mutate({
               orderId: order.id,
               workspaceId: params.workspaceId,
               severity: severity as never,
            })
         }}
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"ghost"}
                  className={cn("w-fit justify-start gap-1.75!", className)}
               >
                  <OrderSeverityIcon
                     severity={order.severity}
                     className="-ml-0.75!"
                  />
                  {ORDER_SEVERITIES_TRANSLATION[order.severity]}
               </Button>
            }
         />
         <ComboboxPopup
            sideOffset={4}
            align="start"
            side="left"
         >
            <ComboboxInput />
            {ORDER_SEVERITIES.map((s) => (
               <ComboboxItem
                  key={s}
                  value={s}
                  keywords={[ORDER_SEVERITIES_TRANSLATION[s]]}
               >
                  {ORDER_SEVERITIES_TRANSLATION[s]}
               </ComboboxItem>
            ))}
         </ComboboxPopup>
      </Combobox>
   )
}
