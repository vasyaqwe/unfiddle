import { useAuth } from "@/auth/hooks"
import { OrderForm } from "@/order/components/order-form"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import type { RouterOutput } from "@unfiddle/core/trpc/types"

import {
   Drawer,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"

export function UpdateOrder({
   order,
   finalFocus,
   open,
   setOpen,
}: {
   order: RouterOutput["order"]["list"][number]
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
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
            <OrderForm
               onSubmit={(data) =>
                  mutation.mutate({
                     ...data,
                     id: order.id,
                     workspaceId: auth.workspace.id,
                  })
               }
               order={order}
            />
         </DrawerPopup>
      </Drawer>
   )
}
