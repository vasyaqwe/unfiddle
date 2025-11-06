import { useEstimate } from "@/estimate/hooks"
import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { EstimateProcurement } from "@unfiddle/core/estimate/procurement/types"
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
   estimateItemId: string
}

export function EstimateProcurementForm({
   estimateProcurement,
   onSubmit,
   children,
}: {
   estimateProcurement?: EstimateProcurement
   onSubmit: (data: FormData) => void
   children: React.ReactNode
}) {
   const estimate = useEstimate()
   const formRef = React.useRef<HTMLFormElement>(null)

   return (
      <form
         ref={formRef}
         className="mt-4 flex grow flex-col space-y-4 md:space-y-8"
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
            <FieldLabel>Прорахунок</FieldLabel>
            <FieldControl
               defaultValue={estimate.name}
               readOnly
               disabled
            />
         </Field>
         <Field>
            <FieldLabel className={"mb-2.5"}>Товар</FieldLabel>
            <Select
               required
               name="estimateItemId"
               defaultValue={
                  estimateProcurement?.estimateItemId ?? estimate.items[0]?.id
               }
            >
               <SelectTrigger
                  render={
                     <Button
                        variant={"secondary"}
                        className={"w-full"}
                     >
                        <SelectValue>
                           {(v) => estimate.items.find((i) => i.id === v)?.name}
                        </SelectValue>
                        <SelectTriggerIcon />
                     </Button>
                  }
               />
               <SelectPopup align="start">
                  {estimate.items.map((item) => (
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
                  defaultValue={estimateProcurement?.quantity}
                  name="quantity"
                  placeholder="шт."
                  min={1}
               />
            </Field>
            <Field>
               <FieldLabel>Ціна</FieldLabel>
               <NumberField
                  required
                  defaultValue={estimateProcurement?.purchasePrice}
                  name="purchasePrice"
                  placeholder={CURRENCY_SYMBOLS[estimate.currency]}
                  min={1}
               />
            </Field>
         </div>
         <Field>
            <FieldLabel>Постачальник</FieldLabel>
            <FieldControl
               name="provider"
               placeholder="Уведіть постачальника"
               defaultValue={estimateProcurement?.provider ?? ""}
            />
         </Field>
         <div>
            <Field>
               <FieldLabel>Комент</FieldLabel>
               <div className="relative w-full">
                  <FieldControl
                     render={
                        <Textarea
                           className="pr-12"
                           name="note"
                           placeholder="Додайте комент"
                           defaultValue={estimateProcurement?.note ?? ""}
                        />
                     }
                  />
               </div>
            </Field>
         </div>
         {children}
      </form>
   )
}
