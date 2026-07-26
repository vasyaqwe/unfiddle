import { HugeiconsIcon } from "@hugeicons/react"
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
import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { EstimateProcurementForm } from "@/estimate/procurement/components/estimate-procurement-form"
import { useCreateEstimateProcurement } from "@/estimate/procurement/mutations/use-create-estimate-procurement"

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
                  <HugeiconsIcon
                     icon={Icons.plus}
                     className="size-6 md:size-5"
                  />
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
                  <Button type="submit">Додати</Button>
               </DrawerFooter>
            </EstimateProcurementForm>
         </DrawerPopup>
      </Drawer>
   )
}
