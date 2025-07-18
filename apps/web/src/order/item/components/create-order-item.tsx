import { OrderItemForm } from "@/order/item/components/order-item-form"
import { useCreateOrderItem } from "@/order/item/mutations/use-create-order-item"
import type { Currency } from "@unfiddle/core/currency/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import * as React from "react"

export function CreateOrderItem({
   children,
   orderId,
   orderCurrency,
   orderName,
}: {
   children?: React.ReactNode
   orderId: string
   orderName: string
   orderCurrency: Currency
}) {
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateOrderItem({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         {children}
         <DrawerPopup>
            <DrawerTitle>Новий товар</DrawerTitle>
            <OrderItemForm
               orderCurrency={orderCurrency}
               orderName={orderName}
               orderId={orderId}
               onSubmit={mutation.mutate}
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </OrderItemForm>
         </DrawerPopup>
      </Drawer>
   )
}
