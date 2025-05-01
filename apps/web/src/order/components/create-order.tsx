import { useAuth } from "@/auth/hooks"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { trpc } from "@/trpc"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Drawer,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@ledgerblocks/ui/components/drawer"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   NumberField,
   NumberFieldInput,
} from "@ledgerblocks/ui/components/number-field"
import { formData, number } from "@ledgerblocks/ui/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"

export function CreateOrder() {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const [open, setOpen] = React.useState(false)
   const mutation = useMutation(
      trpc.order.create.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries(
               trpc.order.list.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )
            setOpen(false)
         },
      }),
   )

   const pending = useDelayedValue(mutation.isPending, 150)

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerTrigger
            render={
               <Button>
                  <Icons.plus /> Додати
               </Button>
            }
         />
         <DrawerPopup>
            <DrawerTitle>Нове замовлення</DrawerTitle>
            <form
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{
                     name: string
                     quantity: string
                     sellingPrice: string
                     note: string
                  }>(e.target)

                  mutation.mutate({
                     workspaceId: auth.workspace.id,
                     name: form.name,
                     quantity: number(form.quantity),
                     sellingPrice: number(form.sellingPrice),
                     note: form.note,
                  })
               }}
            >
               <Field>
                  <FieldLabel>Назва</FieldLabel>
                  <FieldControl
                     required
                     placeholder="Уведіть назву товару"
                     name="name"
                  />
               </Field>
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        name="quantity"
                        min={1}
                     >
                        <NumberFieldInput placeholder="шт." />
                     </NumberField>
                  </Field>
                  <Field>
                     <FieldLabel>Ціна продажу</FieldLabel>
                     <NumberField
                        required
                        name="sellingPrice"
                        min={1}
                     >
                        <NumberFieldInput placeholder="₴" />
                     </NumberField>
                  </Field>
               </div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <FieldControl
                     name="note"
                     placeholder="Додайте комент"
                  />
               </Field>
               <Button
                  pending={pending}
                  disabled={pending}
                  className="mt-auto md:mr-auto"
               >
                  Додати
               </Button>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
