import { useAuth } from "@/auth/hooks"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { ORDER_SEVERITIES_TRANSLATION } from "@/order/constants"
import { useCreateOrder } from "@/order/mutations/create"
import { ORDER_SEVERITIES } from "@ledgerblocks/core/order/constants"
import type { OrderSeverity } from "@ledgerblocks/core/order/types"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
   ComboboxTriggerIcon,
} from "@ledgerblocks/ui/components/combobox"
import {
   Drawer,
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
import * as React from "react"

export function CreateOrder({ children }: { children?: React.ReactNode }) {
   const auth = useAuth()
   const [open, setOpen] = React.useState(false)
   const [severity, setSeverity] = React.useState<OrderSeverity>("low")
   const mutation = useCreateOrder({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   const pending = useDelayedValue(mutation.isPending, 150)

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         {children}
         <DrawerPopup>
            <DrawerTitle>Нове замовлення</DrawerTitle>
            <form
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{
                     name: string
                     quantity: string
                     sellingPrice: string
                     note: string
                  }>(e.target)

                  mutation.mutate({
                     workspaceId: auth.workspace.id,
                     name: form.name,
                     quantity: number(form.quantity),
                     sellingPrice: number(form.sellingPrice),
                     note: form.note,
                     severity,
                  })
               }}
            >
               <Field>
                  <FieldLabel>Назва</FieldLabel>
                  <FieldControl
                     required
                     placeholder="Уведіть назву товару"
                     name="name"
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
                     <FieldLabel>Ціна продажу</FieldLabel>
                     <NumberField
                        required
                        name="sellingPrice"
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
               <Field>
                  <FieldLabel className={"mb-2.5"}>Пріорітет</FieldLabel>
                  <Combobox
                     value={severity}
                     onValueChange={(s) => setSeverity(s as never)}
                  >
                     <ComboboxTrigger
                        render={
                           <Button
                              variant={"secondary"}
                              className="w-32 justify-start"
                           >
                              {ORDER_SEVERITIES_TRANSLATION[severity]}
                              <ComboboxTriggerIcon />
                           </Button>
                        }
                     />
                     <ComboboxPopup align="start">
                        <ComboboxInput placeholder="Пріорітет" />
                        {ORDER_SEVERITIES.map((s) => (
                           <ComboboxItem
                              key={s}
                              value={s}
                              keywords={[ORDER_SEVERITIES_TRANSLATION[s]]}
                           >
                              {ORDER_SEVERITIES_TRANSLATION[s]}
                           </ComboboxItem>
                        ))}
                     </ComboboxPopup>
                  </Combobox>
               </Field>
               <Button
                  pending={pending}
                  disabled={pending}
                  className="mt-auto md:mr-auto"
               >
                  Додати
               </Button>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
