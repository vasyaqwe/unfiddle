import { ProcurementForm } from "@/procurement/components/procurement-form"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import type { OrderItem } from "@unfiddle/core/order/types"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"

export function UpdateProcurement({
   procurement,
   finalFocus,
   open,
   setOpen,
   orderName,
   orderItems,
}: {
   procurement: Procurement
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
   orderName: string

   orderItems: OrderItem[]
}) {
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
               orderItems={orderItems}
               orderName={orderName}
               onSubmit={(data) =>
                  mutation.mutate({
                     ...data,
                     id: procurement.id,
                  })
               }
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
