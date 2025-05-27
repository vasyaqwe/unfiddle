import { useAuth } from "@/auth/hooks"
import { useCreateProcurement } from "@/procurement/mutations/use-create-procurement"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@unfiddle/ui/components/drawer"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   NumberField,
   NumberFieldInput,
} from "@unfiddle/ui/components/number-field"
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function CreateProcurement({
   orderName,
   orderId,
   empty,
}: { orderName: string; orderId: string; empty: boolean }) {
   const auth = useAuth()
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
            <form
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{
                     quantity: string
                     purchasePrice: string
                     note: string
                  }>(e.target)

                  mutation.mutate({
                     orderId,
                     workspaceId: auth.workspace.id,
                     quantity: number(form.quantity),
                     purchasePrice: number(form.purchasePrice),
                     note: form.note,
                  })
               }}
            >
               <Field>
                  <FieldLabel>Замовлення</FieldLabel>
                  <FieldControl
                     defaultValue={orderName}
                     readOnly
                     disabled
                  />
               </Field>
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        name="quantity"
                        min={1}
                     >
                        <NumberFieldInput placeholder="шт." />
                     </NumberField>
                  </Field>
                  <Field>
                     <FieldLabel>Ціна</FieldLabel>
                     <NumberField
                        required
                        name="purchasePrice"
                        min={1}
                     >
                        <NumberFieldInput placeholder="₴" />
                     </NumberField>
                  </Field>
               </div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <FieldControl
                     name="note"
                     placeholder="Додайте комент"
                  />
               </Field>
               <Button className="mt-auto lg:mr-auto">Додати</Button>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
