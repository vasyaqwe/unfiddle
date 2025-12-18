import { useAuth } from "@/auth/hooks"
import { OrderForm } from "@/order/components/order-form"
import { useUpdateOrder } from "@/order/update/use-update-order"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { Button } from "@unfiddle/ui/components/button"

import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"

interface Props {
   orderId: string
   finalFocus: React.RefObject<HTMLElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}

export function UpdateOrder({ orderId, finalFocus, open, setOpen }: Props) {
   const auth = useAuth()
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
            <SuspenseBoundary>
               <OrderForm
                  open={open}
                  onSubmit={(form) =>
                     mutation.mutate({
                        orderId,
                        workspaceId: auth.workspace.id,
                        name: form.name,
                        sellingPrice: number(form.sellingPrice),
                        note: form.note,
                        clientId: form.clientId,
                        severity: form.severity,
                        paymentType: form.paymentType,
                        deliversAt: form.deliversAt,
                        currency: form.currency,
                     })
                  }
                  orderId={orderId}
               >
                  <DrawerFooter>
                     <Button>Зберегти</Button>
                     <DrawerClose
                        render={
                           <Button variant={"secondary"}>Відмінити</Button>
                        }
                     />
                  </DrawerFooter>
               </OrderForm>
            </SuspenseBoundary>
         </DrawerPopup>
      </Drawer>
   )
}
