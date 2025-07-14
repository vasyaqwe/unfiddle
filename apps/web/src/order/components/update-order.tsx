import { useAuth } from "@/auth/hooks"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import { ORDER_SEVERITIES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_SEVERITIES } from "@unfiddle/core/order/constants"
import type { OrderSeverity } from "@unfiddle/core/order/types"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"

import {
   Drawer,
   DrawerClose,
   DrawerPopup,
   DrawerTitle,
} from "@unfiddle/ui/components/drawer"
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
import { formData, number } from "@unfiddle/ui/utils"
import * as React from "react"

export function UpdateOrder({
   order,
   finalFocus,
   open,
   setOpen,
}: {
   order: RouterOutput["order"]["list"][number]
   finalFocus: React.RefObject<HTMLButtonElement | null>
   open: boolean
   setOpen: (open: boolean) => void
}) {
   const auth = useAuth()
   const [severity, setSeverity] = React.useState<OrderSeverity>(order.severity)
   const mutation = useUpdateOrder({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })
   const formRef = React.useRef<HTMLFormElement>(null)

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerPopup
            onClick={(e) => {
               e.stopPropagation()
            }}
            finalFocus={finalFocus}
         >
            <DrawerTitle>Редагувати замовлення</DrawerTitle>
            <form
               ref={formRef}
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const activeElement = document.activeElement as HTMLElement
                  if (
                     activeElement &&
                     formRef.current?.contains(activeElement)
                  ) {
                     activeElement.blur()
                  }

                  requestAnimationFrame(() => {
                     const form = formData<{
                        name: string
                        quantity: string
                        sellingPrice: string
                        note: string
                        groupId: string
                     }>(e.target)
                     mutation.mutate({
                        id: order.id,
                        workspaceId: auth.workspace.id,
                        groupId: form.groupId === "" ? null : form.groupId,
                        name: form.name,
                        quantity:number(form.quantity),
                        sellingPrice: number(form.sellingPrice),
                        note: form.note,
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
                     defaultValue={order.name}
                  />
               </Field>
               <div className="grid grid-cols-2 gap-3 md:gap-8">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        defaultValue={order.quantity}
                        name="quantity"
                        placeholder="шт."
                        min={1}
                     />
                  </Field>
                  <Field>
                     <FieldLabel>Ціна продажу</FieldLabel>
                     <NumberField
                        required
                        defaultValue={order.sellingPrice}
                        name="sellingPrice"
                        placeholder="₴"
                        min={1}
                     />
                  </Field>
               </div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <FieldControl
                     name="note"
                     placeholder="Додайте комент"
                     defaultValue={order.note}
                  />
               </Field>
               <div className="grid gap-3 md:grid-cols-2 md:gap-8">
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
                           defaultValue={order.groupId ?? ""}
                        />
                     </div>
                  </Field>
                  <Field>
                     <FieldLabel className={"mb-2.5"}>Пріорітет</FieldLabel>
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
               </div>
               <div className="mt-auto flex justify-between">
                  <Button>Зберегти</Button>
                  <DrawerClose
                     render={<Button variant={"secondary"}>Відмінити</Button>}
                  />
               </div>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
