import { useOrder } from "@/order/hooks"
import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import {
   Field,
   FieldControl,
   FieldGroup,
   FieldLabel,
} from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"

type FormData = {
   name: string
   quantity: string
   desiredPrice: string
}

export function OrderItemForm({
   orderItem,
   onSubmit,
   children,
}: {
   orderItem?:
      | NonNullable<RouterOutput["order"]["one"]>["items"][number]
      | undefined
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
         <FieldGroup className="md:grid-cols-[1fr_4rem_5rem_2rem] md:gap-5">
            <Field>
               <FieldLabel>Назва</FieldLabel>
               <FieldControl
                  required
                  name="name"
                  placeholder="Уведіть назву"
                  defaultValue={orderItem?.name ?? ""}
               />
            </Field>
            <Field>
               <FieldLabel>Кількість</FieldLabel>
               <NumberField
                  required
                  name="quantity"
                  placeholder="шт."
                  min={1}
                  defaultValue={orderItem?.quantity ?? 1}
               />
            </Field>
            <Field>
               <FieldLabel>Баж. ціна</FieldLabel>
               <NumberField
                  placeholder={CURRENCY_SYMBOLS[order.currency]}
                  name="desiredPrice"
                  defaultValue={
                     orderItem?.desiredPrice === 0
                        ? undefined
                        : (orderItem?.desiredPrice ?? undefined)
                  }
               />
            </Field>
         </FieldGroup>
         {children}
      </form>
   )
}
