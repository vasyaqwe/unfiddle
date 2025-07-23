import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { ProcurementForm } from "@/procurement/components/procurement-form"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"

export function UpdateProcurement({
   procurement,
   finalFocus,
   open,
   setOpen,
}: {
   procurement: Procurement
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const order = useOrder()
   const attachments = useAttachments({
      subjectId: procurement.id,
   })
   const mutation = useUpdateProcurement({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
      onSuccess: () => attachments.clear(),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup finalFocus={finalFocus}>
            <DrawerTitle>Редагувати закупівлю</DrawerTitle>
            <ProcurementForm
               onSubmit={(form) => {
                  mutation.mutate({
                     ...form,
                     procurementId: procurement.id,
                     workspaceId: auth.workspace.id,
                     purchasePrice: number(form.purchasePrice),
                     quantity: number(form.quantity),
                     orderId: order.id,
                     attachments: attachments.uploaded,
                  })
               }}
               procurement={procurement}
            >
               <DrawerFooter>
                  <Button>Зберегти</Button>
                  <DrawerClose
                     render={<Button variant={"secondary"}>Відмінити</Button>}
                  />
               </DrawerFooter>
            </ProcurementForm>
         </DrawerPopup>
      </Drawer>
   )
}
