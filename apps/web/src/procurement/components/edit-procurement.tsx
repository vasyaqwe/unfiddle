import { useAuth } from "@/auth/hooks"
import { useUpdateProcurement } from "@/procurement/mutations/update"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Drawer,
   DrawerClose,
   DrawerPopup,
   DrawerTitle,
} from "@ledgerblocks/ui/components/drawer"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import {
   NumberField,
   NumberFieldInput,
} from "@ledgerblocks/ui/components/number-field"
import { formData, number } from "@ledgerblocks/ui/utils"
import type * as React from "react"

export function EditProcurement({
   procurement,
   finalFocus,
   open,
   setOpen,
}: {
   procurement: RouterOutput["order"]["list"][number]["procurements"][number]
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
                     id: procurement.id,
                     workspaceId: auth.workspace.id,
                     quantity: number(form.quantity),
                     purchasePrice: number(form.purchasePrice),
                     note: form.note,
                  })
               }}
            >
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        name="quantity"
                        min={1}
                        defaultValue={procurement.quantity}
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
                        defaultValue={procurement.purchasePrice}
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
