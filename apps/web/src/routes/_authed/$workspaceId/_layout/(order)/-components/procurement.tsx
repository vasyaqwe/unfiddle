import { useOrder } from "@/order/hooks"
import { UpdateProcurement } from "@/procurement/components/update-procurement"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
import { useDeleteProcurement } from "@/procurement/mutations/use-delete-procurement"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import { procurementStatusGradient } from "@/procurement/utils"
import { AlignedColumn } from "@/ui/components/aligned-column"
import { UserAvatar } from "@/user/components/user-avatar"
import { useParams } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatNumber } from "@unfiddle/core/number"
import { PROCUREMENT_STATUSES } from "@unfiddle/core/procurement/constants"
import type { Procurement as ProcurementType } from "@unfiddle/core/procurement/types"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import {
   AlertDialog,
   AlertDialogClose,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogPopup,
   AlertDialogTitle,
} from "@unfiddle/ui/components/dialog/alert"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { Separator } from "@unfiddle/ui/components/separator"
import { useTheme } from "next-themes"
import * as React from "react"

export function Procurement({
   procurement,
}: {
   procurement: ProcurementType
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId",
   })
   const order = useOrder()
   const theme = useTheme()
   const [from, to] = procurementStatusGradient(
      procurement.status,
      theme.resolvedTheme ?? "light",
   )
   // const _profit = (order.sellingPrice - procurement.purchasePrice) * procurement.quantity
   const update = useUpdateProcurement()
   const deleteItem = useDeleteProcurement()

   const [updateOpen, setUpdateOpen] = React.useState(false)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <div className="gap-3 border-neutral border-t p-3 text-left first:border-none lg:gap-4 lg:p-2 lg:pl-3">
         {procurement.orderItem?.name ? (
            <p className="line-clamp-1 font-medium font-mono max-lg:w-[calc(100%-2rem)] lg:hidden lg:text-sm">
               {procurement.orderItem.name}
            </p>
         ) : null}
         <div className="flex w-full items-center gap-3 max-lg:mt-2 lg:gap-4">
            <AlignedColumn
               id={`${order.id}_p_creator`}
               className="flex items-center gap-1.5 whitespace-nowrap font-medium"
            >
               <UserAvatar
                  size={16}
                  user={procurement.creator}
                  className="inline-block"
               />
               <span className="line-clamp-1">{procurement.creator.name}</span>
            </AlignedColumn>
            {procurement.orderItem ? (
               <AlignedColumn
                  id={`${order.id}_p_item_name`}
                  className="font-medium font-mono max-lg:hidden lg:text-sm"
               >
                  {procurement.orderItem.name}
               </AlignedColumn>
            ) : null}
            <AlignedColumn
               id={`${order.id}_p_quantity`}
               className="whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatNumber(procurement.quantity)} шт.
            </AlignedColumn>
            <Separator className={"h-4 w-px bg-surface-7 lg:hidden"} />
            <AlignedColumn
               id={`${order.id}_p_price`}
               className="whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatCurrency(procurement.purchasePrice, {
                  currency: order.currency,
               })}
            </AlignedColumn>
            <Combobox
               value={procurement.status}
               onValueChange={(status) =>
                  update.mutate({
                     id: procurement.id,
                     workspaceId: params.workspaceId,
                     status: status as never,
                  })
               }
            >
               <ComboboxTrigger
                  className={"ml-auto cursor-pointer"}
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <Badge
                     size={"sm"}
                     style={{
                        background: `linear-gradient(140deg, ${from}, ${to})`,
                     }}
                  >
                     {PROCUREMENT_STATUSES_TRANSLATION[procurement.status]}
                  </Badge>
               </ComboboxTrigger>
               <ComboboxPopup
                  align="end"
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <ComboboxInput />
                  {PROCUREMENT_STATUSES.map((s) => (
                     <ComboboxItem
                        key={s}
                        value={s}
                        keywords={[PROCUREMENT_STATUSES_TRANSLATION[s]]}
                     >
                        {PROCUREMENT_STATUSES_TRANSLATION[s]}
                     </ComboboxItem>
                  ))}
               </ComboboxPopup>
            </Combobox>
            <Menu>
               <MenuTrigger
                  ref={menuTriggerRef}
                  render={
                     <Button
                        variant={"ghost"}
                        kind={"icon"}
                        className="shrink-0 max-lg:absolute max-lg:top-1 max-lg:right-1"
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
                  <MenuItem
                     destructive
                     onClick={() => setDeleteAlertOpen(true)}
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               </MenuPopup>
            </Menu>
         </div>
         <div className="mt-2 flex lg:mt-1">
            {procurement.provider ? (
               <>
                  <p className="lg:!max-w-[80ch] empty:hidden">
                     {procurement.provider}
                  </p>
                  <Separator className="mx-2.5 my-auto h-4 w-px" />
               </>
            ) : null}
            <p className="lg:!max-w-[80ch] whitespace-pre-wrap empty:hidden">
               {procurement.note}
            </p>
         </div>
         {/* <p className="col-start-1 whitespace-nowrap font-medium font-mono text-[1rem] max-lg:order-3 max-lg:self-center lg:mt-1 lg:ml-auto lg:text-right">
            {profit === 0 ? null : (
               <ProfitArrow
                  className="mr-1.5 mb-[-0.2rem] lg:mb-[-0.21rem]"
                  profit={profit > 0 ? "positive" : "negative"}
               />
            )}
            {formatCurrency(profit)}{" "}
         </p> */}

         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateProcurement
               procurement={procurement}
               open={updateOpen}
               setOpen={setUpdateOpen}
               finalFocus={menuTriggerRef}
            />
            <AlertDialog
               open={deleteAlertOpen}
               onOpenChange={setDeleteAlertOpen}
            >
               <AlertDialogPopup
                  finalFocus={menuTriggerRef}
                  onClick={(e) => e.stopPropagation()}
               >
                  <AlertDialogTitle>Видалити закупівлю?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Буде видалена назавжди.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                     <AlertDialogClose
                        render={<Button variant="secondary">Відмінити</Button>}
                     />
                     <AlertDialogClose
                        render={
                           <Button
                              variant={"destructive"}
                              onClick={() =>
                                 deleteItem.mutate({
                                    id: procurement.id,
                                    workspaceId: params.workspaceId,
                                 })
                              }
                           >
                              Видалити
                           </Button>
                        }
                     />
                  </AlertDialogFooter>
               </AlertDialogPopup>
            </AlertDialog>
         </div>
      </div>
   )
}
