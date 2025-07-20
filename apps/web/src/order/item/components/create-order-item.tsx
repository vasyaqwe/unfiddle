import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { OrderItemForm } from "@/order/item/components/order-item-form"
import { useCreateOrderItem } from "@/order/item/mutations/use-create-order-item"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateOrderItem({
   children,
}: {
   children?: React.ReactNode
}) {
   const auth = useAuth()
   const order = useOrder()
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
               onSubmit={(form) => {
                  mutation.mutate({
                     orderId: order.id,
                     workspaceId: auth.workspace.id,
                     name: form.name,
                     quantity: number(form.quantity),
                     desiredPrice: number(form.desiredPrice),
                  })
               }}
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </OrderItemForm>
         </DrawerPopup>
      </Drawer>
   )
}
