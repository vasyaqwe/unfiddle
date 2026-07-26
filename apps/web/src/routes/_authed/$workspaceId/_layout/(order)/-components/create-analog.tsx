import { BulbIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useParams } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import {
   Popover,
   PopoverPopup,
   PopoverTrigger,
} from "@unfiddle/ui/components/popover"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { formData } from "@unfiddle/ui/utils"
import * as React from "react"
import { useOrder } from "@/order/hooks"
import { useUpdateOrder } from "@/order/update/use-update-order"

export function CreateAnalog() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const order = useOrder()
   const update = useUpdateOrder({ onMutate: () => setOpen(false) })
   const [open, setOpen] = React.useState(false)

   return (
      <Popover
         open={open}
         onOpenChange={setOpen}
      >
         <Tooltip>
            <PopoverTrigger
               render={
                  <TooltipTrigger
                     render={
                        <Button
                           kind={"icon"}
                           variant={"secondary"}
                        >
                           <HugeiconsIcon
                              icon={BulbIcon}
                              className="size-5 md:size-4"
                           />
                        </Button>
                     }
                  />
               }
            />
            <TooltipPopup>Запропонувати аналог</TooltipPopup>
         </Tooltip>
         <PopoverPopup align={"end"}>
            <form
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{ name: string }>(e.target)
                  update.mutate({
                     orderId: order.id,
                     workspaceId: params.workspaceId,
                     analogs: [...order.analogs, form.name],
                  })
               }}
            >
               <Field>
                  <FieldLabel>Запропонувати аналог</FieldLabel>
                  <FieldControl
                     required
                     placeholder="Уведіть назву товару"
                     name="name"
                  />
               </Field>
               <Button
                  className="mt-4 w-full"
                  type="submit"
               >
                  Додати
               </Button>
            </form>
         </PopoverPopup>
      </Popover>
   )
}
