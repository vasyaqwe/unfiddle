import { OrderItemForm } from "@/order/item/components/order-item-form"
import { useUpdateOrderItem } from "@/order/item/mutations/use-update-order-item"
import type { Currency } from "@unfiddle/core/currency/types"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"

export function UpdateOrderItem({
   children,
   finalFocus,
   open,
   setOpen,
   orderItem,
   orderId,
   orderName,
   orderCurrency,
}: {
   children?: React.ReactNode
   orderItem: OrderItem
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
   orderId: string
   orderName: string
   orderCurrency: Currency
}) {
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
               orderCurrency={orderCurrency}
               orderItem={orderItem}
               orderName={orderName}
               orderId={orderId}
               onSubmit={(data) =>
                  mutation.mutate({
                     ...data,
                     id: orderItem.id,
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
