import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { EstimateItemForm } from "@/estimate/item/components/estimate-item-form"
import { useUpdateEstimateItem } from "@/estimate/item/mutations/use-update-estimate-item"
import type { EstimateItem } from "@unfiddle/core/estimate/item/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"

export function UpdateEstimateItem({
   children,
   finalFocus,
   open,
   setOpen,
   estimateItem,
}: {
   children?: React.ReactNode
   estimateItem: EstimateItem
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const estimate = useEstimate()
   const mutation = useUpdateEstimateItem({
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
            <DrawerTitle>Редагувати товар</DrawerTitle>
            <EstimateItemForm
               estimateItem={estimateItem}
               onSubmit={(form) =>
                  mutation.mutate({
                     ...form,
                     desiredPrice: number(form.desiredPrice),
                     quantity: number(form.quantity),
                     estimateItemId: estimateItem.id,
                     estimateId: estimate.id,
                     workspaceId: auth.workspace.id,
                  })
               }
            >
               <DrawerFooter>
                  <Button>Зберегти</Button>
               </DrawerFooter>
            </EstimateItemForm>
         </DrawerPopup>
      </Drawer>
   )
}
