import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { ProcurementForm } from "@/procurement/components/procurement-form"
import { useCreateProcurement } from "@/procurement/mutations/use-create-procurement"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import { number } from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateProcurement() {
   const auth = useAuth()
   const order = useOrder()
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateProcurement({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })
   const attachments = useAttachments({
      subjectId: `${order.id}_procurement`,
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerTrigger
            render={
               <Button variant={"secondary"}>
                  <Icons.plus />
                  Додати
               </Button>
            }
         />
         <DrawerPopup>
            <DrawerTitle>Нова закупівля</DrawerTitle>
            <ProcurementForm
               onSubmit={(form) =>
                  mutation.mutate({
                     ...form,
                     workspaceId: auth.workspace.id,
                     orderId: order.id,
                     purchasePrice: number(form.purchasePrice),
                     quantity: number(form.quantity),
                     attachments: attachments.uploaded,
                  })
               }
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </ProcurementForm>
         </DrawerPopup>
      </Drawer>
   )
}
