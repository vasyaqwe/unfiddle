import { useOrder } from "@/order/hooks"
import { UpdateOrderItem } from "@/order/item/components/update-order-item"
import { useDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { useParams } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import type { OrderItem as OrderItemType } from "@unfiddle/core/order/item/types"
import { Button } from "@unfiddle/ui/components/button"
import { Card } from "@unfiddle/ui/components/card"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { Separator } from "@unfiddle/ui/components/separator"
import * as React from "react"

export function OrderItem({
   item,
}: {
   item: OrderItemType
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId",
   })
   const order = useOrder()
   const [updateOpen, setUpdateOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const deleteItem = useDeleteOrderItem()

   return (
      <Card className="mt-1 items-center border-surface-12/15 p-3 text-left lg:flex lg:gap-2 lg:p-2 lg:pl-3">
         <span className="line-clamp-1 font-medium max-lg:w-[calc(100%-2rem)]">
            {" "}
            {item.name}
         </span>
         <Separator className="w-full max-lg:my-2 lg:mx-1 lg:h-4 lg:w-px" />
         <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-mono"> {item.quantity} шт.</span>
            {item.desiredPrice ? (
               <>
                  <Separator className="mx-1 h-4 w-px" />
                  <span className="font-mono">
                     Бажано по{" "}
                     {formatCurrency(item.desiredPrice, {
                        currency: order.currency,
                     })}
                  </span>
               </>
            ) : null}
         </span>
         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateOrderItem
               orderItem={item}
               open={updateOpen}
               setOpen={setUpdateOpen}
               finalFocus={menuTriggerRef}
            />
         </div>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="shrink-0 justify-self-end max-lg:absolute max-lg:top-1 max-lg:right-1 lg:ml-auto"
                  >
                     <Icons.ellipsisHorizontal />
                  </Button>
               }
            />
            <MenuPopup
               align="end"
               onClick={(e) => {
                  e.stopPropagation()
               }}
            >
               <MenuItem
                  onClick={() => {
                     setUpdateOpen(true)
                  }}
               >
                  <Icons.pencil />
                  Редагувати
               </MenuItem>
               {order.items.length === 1 ? null : (
                  <MenuItem
                     destructive
                     onClick={() =>
                        deleteItem.mutate({
                           workspaceId: params.workspaceId,
                           orderId: order.id,
                           orderItemId: item.id,
                        })
                     }
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               )}
            </MenuPopup>
         </Menu>
      </Card>
   )
}
