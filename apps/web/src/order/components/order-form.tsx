import { useAuth } from "@/auth/hooks"
import { ORDER_SEVERITIES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_SEVERITIES } from "@unfiddle/core/order/constants"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import type { RouterInput, RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
import { Checkbox } from "@unfiddle/ui/components/checkbox"
import { DateInput } from "@unfiddle/ui/components/date-input"
import { DrawerClose } from "@unfiddle/ui/components/drawer"
import {
   Field,
   FieldControl,
   FieldGroup,
   FieldLabel,
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
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function OrderForm({
   order,
   onSubmit,
}: {
   order?: RouterOutput["order"]["list"][number] | undefined
   onSubmit: (data: RouterInput["order"]["create"]) => void
}) {
   const auth = useAuth()
   const [severity, setSeverity] = React.useState<OrderSeverity>(
      order?.severity ?? "low",
   )
   const [deliversAt, setDeliversAt] = React.useState(order?.deliversAt ?? null)
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
                  quantity: number(form.quantity),
                  sellingPrice: number(form.sellingPrice),
                  desiredPrice:
                     form.desiredPrice.length === 0
                        ? null
                        : number(form.desiredPrice),
                  note: form.note,
                  client: form.client.length === 0 ? null : form.client,
                  vat: form.vat === "on",
                  severity,
               })
            })
         }}
      >
         <Field>
            <FieldLabel>Назва</FieldLabel>
            <FieldControl
               required
               placeholder="Уведіть назву товару"
               name="name"
               defaultValue={order?.name ?? ""}
            />
         </Field>
         <FieldGroup>
            <Field>
               <FieldLabel>Кількість</FieldLabel>
               <NumberField
                  required
                  defaultValue={order?.quantity}
                  name="quantity"
                  placeholder="шт."
                  min={1}
               />
            </Field>
            <Field>
               <FieldLabel>Ціна продажу</FieldLabel>
               <NumberField
                  defaultValue={
                     order?.sellingPrice === 0 ? undefined : order?.sellingPrice
                  }
                  name="sellingPrice"
                  placeholder="₴"
               />
            </Field>
         </FieldGroup>
         <Field>
            <FieldLabel>Бажана ціна закупівлі</FieldLabel>
            <NumberField
               name="desiredPrice"
               placeholder="₴"
               defaultValue={order?.desiredPrice ?? undefined}
            />
         </Field>
         <FieldGroup>
            <Field>
               <FieldLabel>Клієнт</FieldLabel>
               <FieldControl
                  name="client"
                  placeholder="Ім'я клієнта"
                  defaultValue={order?.client ?? ""}
               />
            </Field>
            <div className="flex w-full flex-col items-start">
               <label
                  htmlFor="term"
                  className="font-medium text-sm"
               >
                  Термін постачання
               </label>
               <DateInput
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
            <Field>
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
            </Field>
         </FieldGroup>
         <Field className={"flex flex-row items-center gap-2"}>
            <Checkbox
               name="vat"
               defaultChecked={order?.vat ?? false}
            />
            <FieldLabel>З ПДВ</FieldLabel>
         </Field>
         <div className="mt-auto flex justify-between">
            <Button>Зберегти</Button>
            <DrawerClose
               render={<Button variant={"secondary"}>Відмінити</Button>}
            />
         </div>
      </form>
   )
}
