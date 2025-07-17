import { useAuth } from "@/auth/hooks"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import type { Procurement } from "@unfiddle/core/procurement/types"
import type { RouterInput } from "@unfiddle/core/trpc/types"
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
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function ProcurementForm({
   procurement,
   onSubmit,
   children,
   orderName,
   orderItems,
}: {
   procurement?: Procurement | undefined
   onSubmit: (
      data: Omit<RouterInput["procurement"]["create"], "orderId"> & {
         orderId?: string
      },
   ) => void
   children: React.ReactNode
   orderName: string
   orderItems: OrderItem[]
}) {
   const auth = useAuth()
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
               const form = formData<{
                  note: string
                  quantity: string
                  purchasePrice: string
                  provider: string
                  orderItemId: string
               }>(e.target)

               onSubmit({
                  workspaceId: auth.workspace.id,
                  quantity: number(form.quantity),
                  purchasePrice: number(form.purchasePrice),
                  note: form.note,
                  provider: form.provider.length === 0 ? null : form.provider,
                  orderItemId: form.orderItemId,
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
         <Field>
            <FieldLabel className={"mb-2.5"}>Товар</FieldLabel>
            <Select
               required
               name="orderItemId"
               defaultValue={orderItems[0]?.id}
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
                  {orderItems.map((item) => (
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
                  placeholder="₴"
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
