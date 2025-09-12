import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { EstimateProcurementForm } from "@/estimate/procurement/components/estimate-procurement-form"
import { useCreateEstimateProcurement } from "@/estimate/procurement/mutations/use-create-estimate-procurement"
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

export function CreateEstimateProcurement() {
   const auth = useAuth()
   const estimate = useEstimate()
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateEstimateProcurement({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
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
            <EstimateProcurementForm
               onSubmit={(form) =>
                  mutation.mutate({
                     ...form,
                     workspaceId: auth.workspace.id,
                     estimateId: estimate.id,
                     purchasePrice: number(form.purchasePrice),
                     quantity: number(form.quantity),
                  })
               }
            >
               <DrawerFooter>
                  <Button>Додати</Button>
               </DrawerFooter>
            </EstimateProcurementForm>
         </DrawerPopup>
      </Drawer>
   )
}
