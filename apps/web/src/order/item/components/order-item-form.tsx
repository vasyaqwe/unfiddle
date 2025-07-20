import { useAuth } from "@/auth/hooks"
import { CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Currency } from "@unfiddle/core/currency/types"
import type { RouterInput, RouterOutput } from "@unfiddle/core/trpc/types"
import {
   Field,
   FieldControl,
   FieldGroup,
   FieldLabel,
} from "@unfiddle/ui/components/field"
import { NumberField } from "@unfiddle/ui/components/number-field"
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function OrderItemForm({
   orderItem,
   orderId,
   onSubmit,
   children,
   orderName,
   orderCurrency,
}: {
   orderItem?:
      | NonNullable<RouterOutput["order"]["one"]>["items"][number]
      | undefined
   orderId: string
   orderName: string
   orderCurrency: Currency
   onSubmit: (data: RouterInput["order"]["item"]["create"]) => void
   children: React.ReactNode
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
                  name: string
                  quantity: string
                  desiredPrice: string
               }>(e.target)

               onSubmit({
                  orderId,
                  workspaceId: auth.workspace.id,
                  name: form.name,
                  quantity: number(form.quantity),
                  desiredPrice: number(form.desiredPrice),
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
                  placeholder={CURRENCY_SYMBOLS[orderCurrency]}
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
