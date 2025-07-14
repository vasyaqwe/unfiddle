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
import { NumberField } from "@unfiddle/ui/components/number-field"
import { formData } from "@unfiddle/ui/utils"
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
   const formRef = React.useRef<HTMLFormElement>(null)

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
               ref={formRef}
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const activeElement = document.activeElement as HTMLElement
                  if (
                     activeElement &&
                     formRef.current?.contains(activeElement)
                  ) {
                     activeElement.blur()
                  }

                  requestAnimationFrame(() => {
                     const form = formData<{
                        quantity: string
                        purchasePrice: string
                        note: string
                     }>(e.target)

                     mutation.mutate({
                        orderId,
                        workspaceId: auth.workspace.id,
                        quantity: +form.quantity,
                        purchasePrice: +form.purchasePrice,
                        note: form.note,
                     })
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
                        placeholder="шт."
                        min={1}
                     />
                  </Field>
                  <Field>
                     <FieldLabel>Ціна</FieldLabel>
                     <NumberField
                        required
                        name="purchasePrice"
                        placeholder="₴"
                        min={1}
                     />
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
