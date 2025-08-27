import { ImagesCarousel } from "@/attachment/components/images-carousel"
import { useDownloadAttachment } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { truncate } from "@/file/components/uploader/utils"
import { useOrder } from "@/order/hooks"
import { UpdateProcurement } from "@/procurement/components/update-procurement"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
import { useDeleteProcurement } from "@/procurement/mutations/use-delete-procurement"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import { updateProcurementOpenAtom } from "@/procurement/store"
import { procurementStatusGradient } from "@/procurement/utils"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { UserAvatar } from "@/user/components/user-avatar"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import {
   ContextMenu,
   ContextMenuItem,
   ContextMenuPopup,
   ContextMenuTrigger,
} from "@unfiddle/ui/components/menu/context"
import { Separator } from "@unfiddle/ui/components/separator"
import { SVGPreview } from "@unfiddle/ui/components/svg-preview"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { useSetAtom } from "jotai"
import { useTheme } from "next-themes"
import * as React from "react"
import { toast } from "sonner"

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
   const auth = useAuth()
   const socket = useSocket()
   const queryClient = useQueryClient()

   const [updateOpen, setUpdateOpen] = React.useState(false)
   const setStoreUpdateOpen = useSetAtom(updateProcurementOpenAtom)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const orderItem = order.items.find((i) => i.id === procurement.orderItemId)

   const otherAttachments = procurement.attachments.filter(
      (attachment) =>
         !attachment.type.startsWith("image/") ||
         attachment.name.endsWith(".svg"),
   )
   const isUrl = (str: string) => {
      if (!str) return false
      if (/\s/.test(str)) return false
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
         return urlObj.hostname.replace(/^www\./, "")
      } catch {
         return str
      }
   }

   const provider = procurement.provider

   return (
      <div className="gap-3 border-neutral border-t p-3 text-left first:border-none lg:gap-4 lg:p-2 lg:pl-3">
         <div className="max-lg:-mt-1.5 max-lg:-mr-1.5 flex items-center">
            {orderItem?.name ? (
               <p className="line-clamp-1 font-medium max-lg:w-[calc(100%-2rem)] lg:mr-3">
                  {orderItem.name}
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
               <Combobox
                  value={procurement.status}
                  onValueChange={(status) =>
                     update.mutate({
                        procurementId: procurement.id,
                        workspaceId: params.workspaceId,
                        status: status as never,
                        orderId: order.id,
                        attachments: [],
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
               id={`${order.id}_p_creator`}
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
               id={`${order.id}_p_quantity`}
               className="mb-px whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatNumber(procurement.quantity)} шт.
            </p>
            <Separator className={"h-4 w-px bg-surface-7"} />
            <p
               id={`${order.id}_p_price`}
               className="mb-px whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatCurrency(procurement.purchasePrice, {
                  currency: order.currency,
               })}
            </p>
         </div>
         <p className="lg:!max-w-[80ch] mt-2 whitespace-pre-wrap empty:hidden lg:mt-2.5">
            {procurement.note}
         </p>
         <div className="mt-3 mb-1 flex flex-wrap gap-1 empty:hidden">
            {otherAttachments.map((attachment) => (
               <FileItem
                  key={attachment.id}
                  attachment={attachment}
                  procurement={procurement}
               />
            ))}
         </div>
         <ImagesCarousel
            subjectId={procurement.id}
            images={procurement.attachments.filter(
               (attachment) =>
                  attachment.type.startsWith("image/") &&
                  !attachment.name.endsWith(".svg"),
            )}
            onDelete={() => {
               socket.procurement.send({
                  action: "delete_attachment",
                  senderId: auth.user.id,
                  procurementId: procurement.id,
                  orderId: order.id,
                  workspaceId: auth.workspace.id,
               })
               queryClient.invalidateQueries(
                  trpc.procurement.list.queryOptions({
                     orderId: order.id,
                     workspaceId: auth.workspace.id,
                  }),
               )
            }}
         />

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
                                    procurementId: procurement.id,
                                    workspaceId: params.workspaceId,
                                    orderId: order.id,
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

function FileItem({
   attachment,
   procurement,
}: {
   attachment: ProcurementType["attachments"][number]
   procurement: ProcurementType
}) {
   const auth = useAuth()
   const download = useDownloadAttachment()
   const deleteItem = useMutation(trpc.attachment.delete.mutationOptions())
   const socket = useSocket()
   const queryClient = useQueryClient()
   const order = useOrder()
   const [contextMenuOpen, setContextMenuOpen] = React.useState(false)

   return (
      <ContextMenu
         open={contextMenuOpen}
         onOpenChange={setContextMenuOpen}
      >
         <ContextMenuTrigger
            render={
               <Button
                  variant={"secondary"}
                  key={attachment.id}
                  disabled={download.isPending}
                  onClick={() => download.mutate([attachment])}
                  className="pl-2 md:pl-2"
                  data-popup-open={contextMenuOpen ? "" : undefined}
               >
                  {attachment.name.endsWith(".svg") ? (
                     <SVGPreview
                        className="size-5"
                        url={attachment.url}
                     />
                  ) : (
                     <Icons.attachment />
                  )}
                  <span className="font-medium text-muted text-sm">
                     {truncate(attachment.name, 36)}
                  </span>
               </Button>
            }
         />
         <ContextMenuPopup>
            <ContextMenuItem
               destructive
               onClick={async () => {
                  deleteItem.mutate(
                     {
                        attachmentId: attachment.id,
                        workspaceId: auth.workspace.id,
                        subjectId: procurement.id,
                     },
                     {
                        onSuccess: () => {
                           socket.procurement.send({
                              action: "delete_attachment",
                              senderId: auth.user.id,
                              procurementId: procurement.id,
                              orderId: order.id,
                              workspaceId: auth.workspace.id,
                           })
                           queryClient.invalidateQueries(
                              trpc.procurement.list.queryOptions({
                                 orderId: order.id,
                                 workspaceId: auth.workspace.id,
                              }),
                           )
                        },
                     },
                  )
               }}
            >
               <Icons.trash />
               Видалити
            </ContextMenuItem>
         </ContextMenuPopup>
      </ContextMenu>
   )
}
