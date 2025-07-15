import { OrderForm } from "@/order/components/order-form"
import { useCreateOrder } from "@/order/mutations/use-create-order"
import {
   Drawer,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import * as React from "react"

export function CreateOrder({ children }: { children?: React.ReactNode }) {
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateOrder({
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
            <DrawerTitle>Нове замовлення</DrawerTitle>
            <OrderForm onSubmit={mutation.mutate} />
         </DrawerPopup>
      </Drawer>
   )
}
