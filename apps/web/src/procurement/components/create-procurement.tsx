import { ProcurementForm } from "@/procurement/components/procurement-form"
import { useCreateProcurement } from "@/procurement/mutations/use-create-procurement"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import * as React from "react"

export function CreateProcurement({
   orderName,
   orderId,
   empty,
   orderItems,
}: {
   orderName: string
   orderId: string
   empty: boolean
   orderItems: OrderItem[]
}) {
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
               orderItems={orderItems}
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
