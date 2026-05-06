import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useCreateOrderItemAssignee } from "@/order/item/assignee/mutations/use-create-order-item-assignee"
import { useDeleteOrderItemAssignee } from "@/order/item/assignee/mutations/use-delete-order-item-assignee"
import { UpdateOrderItem } from "@/order/item/components/update-order-item"
import { useDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { UserAvatar } from "@/user/components/user-avatar"
import { useParams } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import type { OrderItem as OrderItemType } from "@unfiddle/core/order/item/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@unfiddle/ui/components/avatar-stack"
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
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import * as React from "react"

export function OrderItem({
   item,
}: {
   item: OrderItemType
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const auth = useAuth()
   const order = useOrder()
   const [updateOpen, setUpdateOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const deleteItem = useDeleteOrderItem()
   const createAssignee = useCreateOrderItemAssignee()
   const deleteAssignee = useDeleteOrderItemAssignee()
   const assigned = item.assignees.some((a) => a.user.id === auth.user.id)

   return (
      <Card className="mt-1 items-center p-3 text-left lg:flex lg:gap-2 lg:p-2 lg:pl-3">
         <span className="line-clamp-1 font-medium max-lg:w-[calc(100%-2rem)]">
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
         {item.assignees.length === 0 ? null : (
            <AvatarStack
               size={24}
               className="max-lg:absolute max-lg:right-4 max-lg:bottom-2"
            >
               {item.assignees.map((assignee) => (
                  <AvatarStackItem key={assignee.user.id}>
                     <Tooltip>
                        <TooltipTrigger
                           delay={0}
                           render={
                              <UserAvatar
                                 size={24}
                                 user={assignee.user}
                              />
                           }
                        />
                        <TooltipPopup>{assignee.user.name}</TooltipPopup>
                     </Tooltip>
                  </AvatarStackItem>
               ))}
            </AvatarStack>
         )}
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
                     if (assigned)
                        return deleteAssignee.mutate({
                           orderItemId: item.id,
                           orderId: order.id,
                           userId: auth.user.id,
                           workspaceId: params.workspaceId,
                        })

                     createAssignee.mutate({
                        orderItemId: item.id,
                        orderId: order.id,
                        userId: auth.user.id,
                        workspaceId: params.workspaceId,
                     })
                  }}
               >
                  {assigned ? (
                     <>
                        <Icons.undo className="size-4.5" />
                        Залишити
                     </>
                  ) : (
                     <>
                        <Icons.pin className="size-5" />
                        Зайняти
                     </>
                  )}
               </MenuItem>
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
