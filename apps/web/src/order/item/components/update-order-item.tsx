import { useAuth } from "@/auth/hooks"
import { OrderItemForm } from "@/order/item/components/order-item-form"
import { useUpdateOrderItem } from "@/order/item/mutations/use-update-order-item"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"

export function UpdateOrderItem({
   children,
   finalFocus,
   open,
   setOpen,
   orderItem,
}: {
   children?: React.ReactNode
   orderItem: OrderItem
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const mutation = useUpdateOrderItem({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         {children}
         <DrawerPopup finalFocus={finalFocus}>
            <DrawerTitle>Новий товар</DrawerTitle>
            <OrderItemForm
               orderItem={orderItem}
               onSubmit={(form) =>
                  mutation.mutate({
                     ...form,
                     desiredPrice: number(form.desiredPrice),
                     quantity: number(form.quantity),
                     id: orderItem.id,
                     workspaceId: auth.workspace.id,
                  })
               }
            >
               <DrawerFooter>
                  <Button>Зберегти</Button>
               </DrawerFooter>
            </OrderItemForm>
         </DrawerPopup>
      </Drawer>
   )
}
