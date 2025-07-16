import { useAuth } from "@/auth/hooks"
import { ORDER_SEVERITIES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_SEVERITIES } from "@unfiddle/core/order/constants"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import type { RouterInput, RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
import { Checkbox } from "@unfiddle/ui/components/checkbox"
import { DateInput } from "@unfiddle/ui/components/date-input"
import {} from "@unfiddle/ui/components/drawer"
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
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function OrderForm({
   order,
   onSubmit,
   children,
}: {
   order?: RouterOutput["order"]["list"][number] | undefined
   onSubmit: (data: RouterInput["order"]["create"]) => void
   children: React.ReactNode
}) {
   const auth = useAuth()
   const [severity, setSeverity] = React.useState<OrderSeverity>(
      order?.severity ?? "low",
   )
   const [deliversAt, setDeliversAt] = React.useState(order?.deliversAt ?? null)
   const [items, setItems] = React.useState<
      {
         name: string
         quantity: number
         desiredPrice: number | null
      }[]
   >(
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
               const form = formData<{
                  name: string
                  quantity: string
                  sellingPrice: string
                  desiredPrice: string
                  note: string
                  client: string
                  groupId: string
                  vat: "on" | "off"
               }>(e.target)

               onSubmit({
                  workspaceId: auth.workspace.id,
                  groupId: form.groupId === "" ? null : form.groupId,
                  name: form.name,
                  sellingPrice: number(form.sellingPrice),
                  note: form.note,
                  client: form.client.length === 0 ? null : form.client,
                  vat: form.vat === "on",
                  deliversAt,
                  severity,
                  items,
                  quantity: 1,
                  desiredPrice: null,
               })
            })
         }}
      >
         <Field>
            <FieldLabel>Назва</FieldLabel>
            <FieldControl
               required
               placeholder="Уведіть назву"
               name="name"
               defaultValue={order?.name ?? ""}
            />
         </Field>
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
                        disabled={!!order}
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
                        disabled={!!order}
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
                        disabled={!!order}
                        placeholder="₴"
                        value={item.desiredPrice}
                        onValueChange={(desiredPrice) =>
                           setItems(
                              items.map((i, itemIdx) =>
                                 idx === itemIdx ? { ...i, desiredPrice } : i,
                              ),
                           )
                        }
                     />
                  </Field>
                  <Button
                     onClick={() =>
                        setItems(items.filter((_, itemIdx) => idx !== itemIdx))
                     }
                     type="button"
                     variant={"ghost"}
                     kind={"icon"}
                     disabled={items.length === 1 || !!order}
                     className="self-end disabled:cursor-not-allowed"
                  >
                     <Icons.trash />
                  </Button>
               </FieldGroup>
            ))}
            <Button
               disabled={!!order}
               onClick={() =>
                  setItems([
                     ...items,
                     { name: "", quantity: 1, desiredPrice: null },
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
                     placeholder="₴"
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
                     value={severity}
                     onValueChange={(s) => setSeverity(s)}
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

            {/* <Field>
               <FieldLabel>До замовлення</FieldLabel>
               <div className="relative">
                  <span className="absolute bottom-[7px] left-0 mt-2 text-[1rem]">
                     №
                  </span>
                  <FieldControl
                     placeholder="000"
                     name="groupId"
                     inputMode="numeric"
                     className={"pl-6"}
                     defaultValue={order?.groupId ?? ""}
                  />
               </div>
            </Field> */}

            <Field className={"flex flex-row items-center gap-2"}>
               <Checkbox
                  name="vat"
                  defaultChecked={order?.vat ?? false}
               />
               <FieldLabel>З ПДВ</FieldLabel>
            </Field>
         </Fieldset>
         {children}
      </form>
   )
}
