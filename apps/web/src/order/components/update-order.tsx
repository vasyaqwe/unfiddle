import { OrderForm } from "@/order/components/order-form"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"

import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"

interface Props {
   order: RouterOutput["order"]["list"][number]
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}

export function UpdateOrder({ order, finalFocus, open, setOpen }: Props) {
   const mutation = useUpdateOrder({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup
            onClick={(e) => {
               e.stopPropagation()
            }}
            finalFocus={finalFocus}
         >
            <DrawerTitle>Редагувати замовлення</DrawerTitle>
            <OrderForm
               onSubmit={(data) =>
                  mutation.mutate({
                     ...data,
                     id: order.id,
                  })
               }
               order={order}
            >
               <DrawerFooter>
                  <Button>Зберегти</Button>
                  <DrawerClose
                     render={<Button variant={"secondary"}>Відмінити</Button>}
                  />
               </DrawerFooter>
            </OrderForm>
         </DrawerPopup>
      </Drawer>
   )
}
