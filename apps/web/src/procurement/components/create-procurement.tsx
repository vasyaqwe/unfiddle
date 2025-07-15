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
import {} from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import {} from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateProcurement({
   orderName,
   orderId,
   empty,
}: { orderName: string; orderId: string; empty: boolean }) {
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateProcurement({
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
                  Додати {empty ? "першу" : ""}
               </Button>
            }
         />
         <DrawerPopup>
            <DrawerTitle>Нова закупівля</DrawerTitle>
            <ProcurementForm
               orderName={orderName}
               onSubmit={(data) =>
                  mutation.mutate({
                     ...data,
                     orderId,
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
