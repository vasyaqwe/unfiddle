import { useAuth } from "@/auth/hooks"
import type { Procurement } from "@unfiddle/core/procurement/types"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import { Textarea } from "@unfiddle/ui/components/textarea"
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function ProcurementForm({
   procurement,
   onSubmit,
   children,
   orderName,
}: {
   procurement?: Procurement | undefined
   onSubmit: (
      data: Omit<RouterInput["procurement"]["create"], "orderId"> & {
         orderId?: string
      },
   ) => void
   children: React.ReactNode
   orderName: string
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
               }>(e.target)

               onSubmit({
                  workspaceId: auth.workspace.id,
                  quantity: number(form.quantity),
                  purchasePrice: number(form.purchasePrice),
                  note: form.note,
                  provider: form.provider.length === 0 ? null : form.provider,
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
