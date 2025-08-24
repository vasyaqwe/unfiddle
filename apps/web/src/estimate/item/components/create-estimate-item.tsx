import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { EstimateItemForm } from "@/estimate/item/components/estimate-item-form"
import { useCreateEstimateItem } from "@/estimate/item/mutations/use-create-estimate-item"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { number } from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateEstimateItem({
   children,
}: {
   children?: React.ReactNode
}) {
   const auth = useAuth()
   const estimate = useEstimate()
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateEstimateItem({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         {children}
         <DrawerPopup>
            <DrawerTitle>Новий товар</DrawerTitle>
            <EstimateItemForm
               onSubmit={(form) => {
                  mutation.mutate({
                     estimateId: estimate.id,
                     workspaceId: auth.workspace.id,
                     name: form.name,
                     quantity: number(form.quantity),
                     desiredPrice: number(form.desiredPrice),
                  })
               }}
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </EstimateItemForm>
         </DrawerPopup>
      </Drawer>
   )
}
