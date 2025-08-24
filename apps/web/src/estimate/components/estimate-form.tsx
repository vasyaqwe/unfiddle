import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CURRENCIES, CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Currency } from "@unfiddle/core/currency/types"
import type { EstimateItem } from "@unfiddle/core/estimate/item/types"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
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

type BareItem = Omit<EstimateItem, "id">

type FormData = {
   name: string
   sellingPrice: string
   note: string
   client: string
   currency: Currency
   items: BareItem[]
}

interface Props {
   estimateId?: string | undefined
   onSubmit: (data: FormData) => void
   children: React.ReactNode
   open?: boolean | undefined
}

export function EstimateForm(props: Props) {
   if (props.estimateId && props.open) return <WithExistingData {...props} />

   return <Form {...props} />
}

function WithExistingData(props: Props) {
   const auth = useAuth()
   const estimate = useSuspenseQuery(
      trpc.estimate.one.queryOptions({
         estimateId: props.estimateId ?? "",
         workspaceId: auth.workspace.id,
      }),
   ).data

   if (estimate === null)
      return (
         <p className="absolute inset-0 m-auto size-fit text-center text-muted">
            Прорахунок не знайдено. Можливо, його видалили.
         </p>
      )

   return (
      <Form
         estimate={estimate}
         {...props}
      />
   )
}

export function Form({
   onSubmit,
   children,
   estimate,
}: { estimate?: RouterOutput["estimate"]["one"] } & Props) {
   const [items, setItems] = React.useState<BareItem[]>([
      {
         name: "",
         quantity: 1,
         desiredPrice: null,
      },
   ])
   const [currency, setCurrency] = React.useState(estimate?.currency ?? "UAH")
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
                  defaultValue={estimate?.name ?? ""}
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
                           <SelectValue placeholder={currency}>
                              {(label) => label}
                           </SelectValue>
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
         {estimate ? null : (
            <Fieldset className={"space-y-2"}>
               <FieldsetLegend className={"md:mb-4"}>Товари</FieldsetLegend>
               <FieldGroup className="max-md:hidden md:grid-cols-[1fr_4rem_5rem_2rem] md:gap-5">
                  <p className="font-medium text-sm">Назва</p>
                  <p className="font-medium text-sm">Кількість</p>
                  <p className="font-medium text-sm">Баж. ціна</p>
               </FieldGroup>
               {items.map((item, idx) => (
                  <FieldGroup
                     key={idx}
                     className="grid-cols-[1fr_1fr_2rem] md:grid-cols-[1fr_4rem_5rem_2rem] md:gap-5"
                  >
                     <Field className={"max-md:col-span-3"}>
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
                           // Add a class name to easily select this input
                           className="order-item-name-input"
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
                  onClick={() => {
                     setItems((prevItems) => [
                        ...prevItems,
                        {
                           name: "",
                           quantity: 1,
                           desiredPrice: null,
                        },
                     ])

                     // Use requestAnimationFrame to wait for the DOM to update
                     requestAnimationFrame(() => {
                        // Find all the item name inputs
                        const itemInputs = document.querySelectorAll(
                           ".order-item-name-input",
                        ) as NodeListOf<HTMLInputElement>
                        // Focus the last one (which is the newly added one)
                        if (itemInputs.length > 0) {
                           itemInputs[itemInputs.length - 1]?.focus()
                        }
                     })
                  }}
                  type="button"
                  className="mt-2 w-full disabled:cursor-not-allowed"
                  variant={"secondary"}
               >
                  <Icons.plus />
                  Додати товар
               </Button>
            </Fieldset>
         )}
         <Fieldset className={"mb-10 space-y-3 md:space-y-8"}>
            <FieldsetLegend className={"md:mb-4"}>Деталі</FieldsetLegend>
            <FieldGroup>
               <Field>
                  <FieldLabel>Ціна продажу</FieldLabel>
                  <NumberField
                     defaultValue={
                        estimate?.sellingPrice === 0
                           ? undefined
                           : estimate?.sellingPrice
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
                     defaultValue={estimate?.client ?? ""}
                  />
               </Field>
            </FieldGroup>
            <div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <div className="relative w-full">
                     <FieldControl
                        render={
                           <Textarea
                              name="note"
                              placeholder="Додайте комент"
                              defaultValue={estimate?.note}
                           />
                        }
                     />
                  </div>
               </Field>
            </div>
         </Fieldset>
         {children}
      </form>
   )
}
