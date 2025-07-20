import { useOrder } from "@/order/hooks"
import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectTriggerIcon,
   SelectValue,
} from "@unfiddle/ui/components/select"
import { Textarea } from "@unfiddle/ui/components/textarea"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"

type FormData = {
   note: string
   quantity: string
   purchasePrice: string
   provider: string
   orderItemId: string
}

export function ProcurementForm({
   procurement,
   onSubmit,
   children,
}: {
   procurement?: Procurement | undefined
   onSubmit: (data: FormData) => void
   children: React.ReactNode
}) {
   const order = useOrder()
   const formRef = React.useRef<HTMLFormElement>(null)

   return (
      <form
         ref={formRef}
         className="mt-4 flex grow flex-col space-y-3 md:space-y-8"
         onSubmit={(e) => {
            e.preventDefault()
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && formRef.current?.contains(activeElement)) {
               activeElement.blur()
            }

            requestAnimationFrame(() => {
               onSubmit(formData<FormData>(e.target))
            })
         }}
      >
         <Field>
            <FieldLabel>Замовлення</FieldLabel>
            <FieldControl
               defaultValue={order.name}
               readOnly
               disabled
            />
         </Field>
         <Field>
            <FieldLabel className={"mb-2.5"}>Товар</FieldLabel>
            <Select
               required
               name="orderItemId"
               defaultValue={order.items[0]?.id}
            >
               <SelectTrigger
                  render={
                     <Button
                        variant={"secondary"}
                        className="w-full justify-start"
                     >
                        <SelectValue>{(label) => label}</SelectValue>
                        <SelectTriggerIcon />
                     </Button>
                  }
               />
               <SelectPopup align="start">
                  {order.items.map((item) => (
                     <SelectItem
                        key={item.id}
                        value={item.id}
                     >
                        {item.name}
                     </SelectItem>
                  ))}
               </SelectPopup>
            </Select>
         </Field>
         <div className="grid grid-cols-2 gap-3">
            <Field>
               <FieldLabel>Кількість</FieldLabel>
               <NumberField
                  required
                  defaultValue={procurement?.quantity}
                  name="quantity"
                  placeholder="шт."
                  min={1}
               />
            </Field>
            <Field>
               <FieldLabel>Ціна</FieldLabel>
               <NumberField
                  required
                  defaultValue={procurement?.purchasePrice}
                  name="purchasePrice"
                  placeholder={CURRENCY_SYMBOLS[order.currency]}
                  min={1}
               />
            </Field>
         </div>
         <Field>
            <FieldLabel>Постачальник</FieldLabel>
            <FieldControl
               name="provider"
               placeholder="Уведіть постачальника"
               defaultValue={procurement?.provider ?? ""}
            />
         </Field>
         <Field>
            <FieldLabel>Комент</FieldLabel>
            <FieldControl
               render={
                  <Textarea
                     name="note"
                     placeholder="Додайте комент"
                     defaultValue={procurement?.note ?? ""}
                  />
               }
            />
         </Field>
         {children}
      </form>
   )
}
