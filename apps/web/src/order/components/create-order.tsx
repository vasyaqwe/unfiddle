import { useAuth } from "@/auth/hooks"
import { OrderForm } from "@/order/components/order-form"
import { useCreateOrder } from "@/order/mutations/use-create-order"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateOrder({ children }: { children?: React.ReactNode }) {
   const auth = useAuth()
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
            <OrderForm
               onSubmit={(form) =>
                  mutation.mutate({
                     ...form,
                     workspaceId: auth.workspace.id,
                     sellingPrice: number(form.sellingPrice),
                     client: form.client.length === 0 ? null : form.client,
                     vat: form.vat === "on",
                  })
               }
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </OrderForm>
         </DrawerPopup>
      </Drawer>
   )
}
