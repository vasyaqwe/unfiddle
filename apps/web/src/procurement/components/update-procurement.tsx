import { useAuth } from "@/auth/hooks"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

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
   const formRef = React.useRef<HTMLFormElement>(null)

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup finalFocus={finalFocus}>
            <DrawerTitle>Редагувати закупівлю</DrawerTitle>
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
                        note: string
                        quantity: string
                        purchasePrice: string
                     }>(e.target)

                     mutation.mutate({
                        id: procurement.id,
                        workspaceId: auth.workspace.id,
                        quantity: number(form.quantity),
                        purchasePrice: number(form.purchasePrice),
                        note: form.note,
                     })
                  })
               }}
            >
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        defaultValue={procurement.quantity}
                        name="quantity"
                        placeholder="шт."
                        min={1}
                     />
                  </Field>
                  <Field>
                     <FieldLabel>Ціна</FieldLabel>
                     <NumberField
                        required
                        defaultValue={procurement.purchasePrice}
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
                     defaultValue={procurement.note ?? ""}
                  />
               </Field>
               <div className="mt-auto flex justify-between">
                  <Button>Зберегти</Button>
                  <DrawerClose
                     render={<Button variant={"secondary"}>Відмінити</Button>}
                  />
               </div>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
