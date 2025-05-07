import { useAuth } from "@/auth/hooks"
import { ORDER_SEVERITIES_TRANSLATION } from "@/order/constants"
import { useUpdateOrder } from "@/order/mutations/update"
import { ORDER_SEVERITIES } from "@ledgerblocks/core/order/constants"
import type { OrderSeverity } from "@ledgerblocks/core/order/types"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
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
import * as React from "react"

export function EditOrder({
   order,
   finalFocus,
   open,
   setOpen,
}: {
   order: RouterOutput["order"]["list"][number]
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const [severity, setSeverity] = React.useState<OrderSeverity>(order.severity)
   const mutation = useUpdateOrder({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup
            onClick={(e) => {
               e.stopPropagation()
            }}
            finalFocus={finalFocus}
         >
            <DrawerTitle>Редагувати замовлення</DrawerTitle>
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
                     id: order.id,
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
                     defaultValue={order.name}
                  />
               </Field>
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        name="quantity"
                        min={1}
                        defaultValue={order.quantity}
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
                        defaultValue={order.sellingPrice ?? undefined}
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
                     defaultValue={order.note}
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
