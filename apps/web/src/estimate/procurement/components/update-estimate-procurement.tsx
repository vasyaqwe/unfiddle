import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { EstimateProcurementForm } from "@/estimate/procurement/components/estimate-procurement-form"
import { useUpdateEstimateProcurement } from "@/estimate/procurement/mutations/use-update-estimate-procurement"
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
   const estimate = useEstimate()
   const attachments = useAttachments({
      subjectId: procurement.id,
   })
   const mutation = useUpdateEstimateProcurement({
      onMutate: () => {
         setOpen(false)
      },
      onError: () => {
         setOpen(true)
      },
      onSuccess: () => attachments.clear(),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={(open) => {
            setOpen(open)
         }}
      >
         <DrawerPopup finalFocus={finalFocus}>
            <DrawerTitle>Редагувати закупівлю</DrawerTitle>
            <EstimateProcurementForm
               onSubmit={(form) => {
                  mutation.mutate({
                     ...form,
                     estimateProcurementId: procurement.id,
                     workspaceId: auth.workspace.id,
                     purchasePrice: number(form.purchasePrice),
                     quantity: number(form.quantity),
                     estimateId: estimate.id,
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
