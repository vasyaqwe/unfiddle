import { useEstimate } from "@/estimate/hooks"
import { UpdateEstimateItem } from "@/estimate/item/components/update-estimate-item"
import { useDeleteEstimateItem } from "@/estimate/item/mutations/use-delete-estimate-item"
import { useParams } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import type { EstimateItem as EstimateItemType } from "@unfiddle/core/estimate/item/types"
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

export function EstimateItem({
   item,
}: {
   item: EstimateItemType
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId",
   })
   const estimate = useEstimate()
   const [updateOpen, setUpdateOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const deleteItem = useDeleteEstimateItem()

   return (
      <Card className="mt-1 items-center p-3 text-left lg:flex lg:gap-2 lg:p-2 lg:pl-3">
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
                        currency: estimate.currency,
                     })}
                  </span>
               </>
            ) : null}
         </span>
         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateEstimateItem
               estimateItem={item}
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
               {estimate.items.length === 1 ? null : (
                  <MenuItem
                     destructive
                     onClick={() =>
                        deleteItem.mutate({
                           workspaceId: params.workspaceId,
                           estimateId: estimate.id,
                           estimateItemId: item.id,
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
