import { CURRENCIES, CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Currency } from "@unfiddle/core/currency/types"
import { ORDER_SEVERITIES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_SEVERITIES } from "@unfiddle/core/order/constants"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
import { Checkbox } from "@unfiddle/ui/components/checkbox"
import { DateInput } from "@unfiddle/ui/components/date-input"
import {
   Field,
   FieldControl,
   FieldGroup,
   FieldLabel,
   Fieldset,
   FieldsetLegend,
} from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
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

type BareOrderItem = Omit<OrderItem, "id">

type FormData = {
   name: string
   quantity: string
   sellingPrice: string
   desiredPrice: string
   note: string
   client: string
   severity: OrderSeverity
   vat: "on" | "off"
   deliversAt: Date | null
   currency: Currency
   items: BareOrderItem[]
}

export function OrderForm({
   order,
   onSubmit,
   children,
}: {
   order?:
      | (Omit<RouterOutput["order"]["list"][number], "procurements"> & {
           items?: OrderItem[]
        })
      | undefined
   onSubmit: (data: FormData) => void
   children: React.ReactNode
}) {
   const [deliversAt, setDeliversAt] = React.useState(order?.deliversAt ?? null)
   const [currency, setCurrency] = React.useState(order?.currency ?? "UAH")
   const [items, setItems] = React.useState<BareOrderItem[]>(
      order?.items ?? [
         {
            name: "",
            quantity: 1,
            desiredPrice: null,
         },
      ],
   )
   const formRef = React.useRef<HTMLFormElement>(null)

   return (
      <form
         ref={formRef}
         className="mt-4 flex grow flex-col space-y-4"
         onSubmit={(e) => {
            e.preventDefault()
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && formRef.current?.contains(activeElement)) {
               activeElement.blur()
            }

            requestAnimationFrame(() => {
               const form = formData<FormData>(e.target)

               onSubmit({
                  ...form,
                  deliversAt,
                  currency,
                  items,
               })
            })
         }}
      >
         <FieldGroup className="grid-cols-[1fr_4rem] md:grid-cols-[1fr_4rem]">
            <Field>
               <FieldLabel>Назва</FieldLabel>
               <FieldControl
                  required
                  placeholder="Уведіть назву"
                  name="name"
                  defaultValue={order?.name ?? ""}
               />
            </Field>
            <Field>
               <FieldLabel className={"mb-2"}>Валюта</FieldLabel>
               <Select
                  value={currency}
                  onValueChange={setCurrency}
               >
                  <SelectTrigger
                     render={
                        <Button variant={"secondary"}>
                           <SelectValue>{(label) => label}</SelectValue>
                           <SelectTriggerIcon />
                        </Button>
                     }
                  />
                  <SelectPopup align="start">
                     {CURRENCIES.map((item) => (
                        <SelectItem
                           key={item}
                           value={item}
                        >
                           {item}
                        </SelectItem>
                     ))}
                  </SelectPopup>
               </Select>
            </Field>
         </FieldGroup>
         {order ? null : (
            <Fieldset className={"space-y-2"}>
               <FieldsetLegend className={"md:mb-4"}>Товари</FieldsetLegend>
               <FieldGroup className="md:grid-cols-[1fr_4rem_5rem_2rem] md:gap-5">
                  <p className="font-medium text-sm">Назва</p>
                  <p className="font-medium text-sm">Кількість</p>
                  <p className="font-medium text-sm">Баж. ціна</p>
               </FieldGroup>
               {items.map((item, idx) => (
                  <FieldGroup
                     key={idx}
                     className="md:grid-cols-[1fr_4rem_5rem_2rem] md:gap-5"
                  >
                     <Field>
                        <FieldControl
                           required
                           placeholder="Уведіть назву"
                           value={item.name}
                           onChange={(e) =>
                              setItems(
                                 items.map((i, itemIdx) =>
                                    idx === itemIdx
                                       ? { ...i, name: e.target.value }
                                       : i,
                                 ),
                              )
                           }
                        />
                     </Field>
                     <Field>
                        <NumberField
                           required
                           placeholder="шт."
                           min={1}
                           value={item.quantity}
                           onValueChange={(quantity) =>
                              setItems(
                                 items.map((i, itemIdx) =>
                                    idx === itemIdx
                                       ? { ...i, quantity: quantity ?? 1 }
                                       : i,
                                 ),
                              )
                           }
                        />
                     </Field>
                     <Field>
                        <NumberField
                           placeholder={CURRENCY_SYMBOLS[currency]}
                           value={item.desiredPrice}
                           onValueChange={(desiredPrice) =>
                              setItems(
                                 items.map((i, itemIdx) =>
                                    idx === itemIdx
                                       ? { ...i, desiredPrice }
                                       : i,
                                 ),
                              )
                           }
                        />
                     </Field>
                     <Button
                        onClick={() =>
                           setItems(
                              items.filter((_, itemIdx) => idx !== itemIdx),
                           )
                        }
                        type="button"
                        variant={"ghost"}
                        kind={"icon"}
                        disabled={items.length === 1}
                        className="self-end disabled:cursor-not-allowed"
                     >
                        <Icons.trash />
                     </Button>
                  </FieldGroup>
               ))}
               <Button
                  onClick={() =>
                     setItems([
                        ...items,
                        {
                           name: "",
                           quantity: 1,
                           desiredPrice: null,
                        },
                     ])
                  }
                  type="button"
                  className="mt-2 w-full disabled:cursor-not-allowed"
                  variant={"secondary"}
               >
                  <Icons.plus />
                  Додати товар
               </Button>
            </Fieldset>
         )}
         <Fieldset className={"space-y-3 md:space-y-8"}>
            <FieldsetLegend className={"md:mb-4"}>Деталі</FieldsetLegend>
            <FieldGroup>
               <Field>
                  <FieldLabel>Ціна продажу</FieldLabel>
                  <NumberField
                     defaultValue={
                        order?.sellingPrice === 0
                           ? undefined
                           : order?.sellingPrice
                     }
                     name="sellingPrice"
                     placeholder={CURRENCY_SYMBOLS[currency]}
                  />
               </Field>
               <Field>
                  <FieldLabel>Клієнт</FieldLabel>
                  <FieldControl
                     name="client"
                     placeholder="Ім'я клієнта"
                     defaultValue={order?.client ?? ""}
                  />
               </Field>
            </FieldGroup>
            <FieldGroup>
               <Field>
                  <FieldLabel className={"mb-2.5"}>Пріоритет</FieldLabel>
                  <Select
                     name="severity"
                     defaultValue={order?.severity ?? "low"}
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
                        {ORDER_SEVERITIES.map((s) => (
                           <SelectItem
                              key={s}
                              value={s}
                           >
                              {ORDER_SEVERITIES_TRANSLATION[s]}
                           </SelectItem>
                        ))}
                     </SelectPopup>
                  </Select>
               </Field>
               <div className="flex w-full flex-col items-start">
                  <label
                     htmlFor="term"
                     className="font-medium text-sm"
                  >
                     Термін постачання
                  </label>
                  <DateInput
                     inDialog
                     id="term"
                     value={deliversAt}
                     onValueChange={setDeliversAt}
                  />
               </div>
            </FieldGroup>
            <Field>
               <FieldLabel>Комент</FieldLabel>
               <FieldControl
                  render={
                     <Textarea
                        name="note"
                        placeholder="Додайте комент"
                        defaultValue={order?.note}
                     />
                  }
               />
            </Field>
            <div>
               <Field className={"mt-3 flex flex-row items-center gap-2"}>
                  <Checkbox
                     name="vat"
                     defaultChecked={order?.vat ?? false}
                  />
                  <FieldLabel>З ПДВ</FieldLabel>
               </Field>
            </div>
         </Fieldset>
         {children}
      </form>
   )
}
