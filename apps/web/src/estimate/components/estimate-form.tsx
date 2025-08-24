import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CURRENCIES, CURRENCY_SYMBOLS } from "@unfiddle/core/currency/constants"
import type { Currency } from "@unfiddle/core/currency/types"
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
   name: string
   sellingPrice: string
   note: string
   client: string
   currency: Currency
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
