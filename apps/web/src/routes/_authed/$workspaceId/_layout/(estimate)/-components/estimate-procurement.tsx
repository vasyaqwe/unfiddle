import { useEstimate } from "@/estimate/hooks"
import { UpdateEstimateProcurement } from "@/estimate/procurement/components/update-estimate-procurement"
import { useDeleteEstimateProcurement } from "@/estimate/procurement/mutations/use-delete-estimate-procurement"
import { updateProcurementOpenAtom } from "@/procurement/store"
import { UserAvatar } from "@/user/components/user-avatar"
import { useParams } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import type { EstimateProcurement as ProcurementType } from "@unfiddle/core/estimate/procurement/types"
import { formatNumber } from "@unfiddle/core/number"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
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
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { useSetAtom } from "jotai"
import * as React from "react"
import { toast } from "sonner"

export function EstimateProcurement({
   procurement,
}: {
   procurement: ProcurementType
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId",
   })
   const estimate = useEstimate()
   const deleteItem = useDeleteEstimateProcurement()
   const [updateOpen, setUpdateOpen] = React.useState(false)
   const setStoreUpdateOpen = useSetAtom(updateProcurementOpenAtom)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const estimateItem = estimate.items.find(
      (i) => i.id === procurement.estimateItemId,
   )
   const isUrl = (str: string) => {
      if (!str) return false
      if (/\s/.test(str) || !str.includes(".")) return false
      try {
         new URL(str.startsWith("http") ? str : `https://${str}`)
         return true
      } catch {
         return false
      }
   }

   const extractDomain = (str: string) => {
      try {
         const urlObj = new URL(str.startsWith("http") ? str : `https://${str}`)
         return decodeURIComponent(urlObj.hostname.replace(/^www\./, ""))
      } catch {
         return str
      }
   }

   const provider = procurement.provider

   return (
      <div className="gap-3 border-neutral border-t p-3 text-left first:border-none lg:gap-4 lg:p-2 lg:pl-3">
         <div className="max-lg:-mt-1.5 max-lg:-mr-1.5 flex items-center">
            {estimateItem?.name ? (
               <p className="line-clamp-1 font-medium max-lg:w-[calc(100%-2rem)] lg:mr-3">
                  {estimateItem.name}
               </p>
            ) : null}
            <div className="ml-auto flex items-center gap-1.5">
               {provider ? (
                  <Tooltip delay={0}>
                     <TooltipTrigger
                        render={
                           <Badge
                              size="sm"
                              className="line-clamp-1 max-w-72 cursor-pointer"
                              onClick={() => {
                                 navigator.clipboard.writeText(provider)
                                 toast.success("Скопійовано!")
                              }}
                           >
                              {isUrl(provider)
                                 ? extractDomain(provider)
                                 : provider}
                           </Badge>
                        }
                     />
                     <TooltipPopup>
                        Натисніть щоб скопіювати постачальника
                     </TooltipPopup>
                  </Tooltip>
               ) : null}
               <Menu>
                  <MenuTrigger
                     ref={menuTriggerRef}
                     render={
                        <Button
                           variant={"ghost"}
                           kind={"icon"}
                           className="shrink-0"
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
                           setStoreUpdateOpen(true)
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
         </div>
         <div className="mt-1 flex w-full items-center gap-3">
            <p
               id={`${estimate.id}_p_creator`}
               className="flex items-center gap-1.5 whitespace-nowrap font-medium"
            >
               <UserAvatar
                  size={16}
                  user={procurement.creator}
                  className="inline-block"
               />
               <span className="line-clamp-1">{procurement.creator.name}</span>
            </p>
            <p
               id={`${estimate.id}_p_quantity`}
               className="mb-px whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatNumber(procurement.quantity)} шт.
            </p>
            <Separator className={"h-4 w-px bg-surface-7"} />
            <p
               id={`${estimate.id}_p_price`}
               className="mb-px whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatCurrency(procurement.purchasePrice, {
                  currency: estimate.currency,
               })}
            </p>
         </div>
         <p className="lg:!max-w-[80ch] mt-2 whitespace-pre-wrap empty:hidden lg:mt-2.5">
            {procurement.note}
         </p>
         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateEstimateProcurement
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
                                    estimateProcurementId: procurement.id,
                                    workspaceId: params.workspaceId,
                                    estimateId: estimate.id,
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
