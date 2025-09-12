import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { EstimateProcurementForm } from "@/estimate/procurement/components/estimate-procurement-form"
import { useOrder } from "@/order/hooks"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import { updateProcurementOpenAtom } from "@/procurement/store"
import type { EstimateProcurement } from "@unfiddle/core/estimate/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"
import { useSetAtom } from "jotai"

export function UpdateEstimateProcurement({
   procurement,
   finalFocus,
   open,
   setOpen,
}: {
   procurement: EstimateProcurement
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const order = useOrder()
   const setStoreUpdateOpen = useSetAtom(updateProcurementOpenAtom)
   const attachments = useAttachments({
      subjectId: procurement.id,
   })
   const mutation = useUpdateProcurement({
      onMutate: () => {
         setOpen(false)
         setStoreUpdateOpen(false)
      },
      onError: () => {
         setOpen(true)
         setStoreUpdateOpen(true)
      },
      onSuccess: () => attachments.clear(),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={(open) => {
            setOpen(open)
            setStoreUpdateOpen(open)
         }}
      >
         <DrawerPopup finalFocus={finalFocus}>
            <DrawerTitle>Редагувати закупівлю</DrawerTitle>
            <EstimateProcurementForm
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
               estimateProcurement={procurement}
            >
               <DrawerFooter>
                  <Button>Зберегти</Button>
                  <DrawerClose
                     render={<Button variant={"secondary"}>Відмінити</Button>}
                  />
               </DrawerFooter>
            </EstimateProcurementForm>
         </DrawerPopup>
      </Drawer>
   )
}
