import { useAuth } from "@/auth/hooks"
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
   const mutation = useUpdateProcurement({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
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
                     id: procurement.id,
                     workspaceId: auth.workspace.id,
                     purchasePrice: number(form.purchasePrice),
                     quantity: number(form.quantity),
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
