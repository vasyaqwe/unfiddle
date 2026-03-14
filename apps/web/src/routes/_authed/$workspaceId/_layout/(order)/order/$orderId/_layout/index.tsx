import { ImagesCarousel } from "@/attachment/components/images-carousel"
import { useAttachments } from "@/attachment/hooks"
import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { ClientSeverityIcon } from "@/client/components/client-severity-icon"
import { FileUploader } from "@/file/components/uploader"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { useCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { ArchiveOrderAlert } from "@/order/components/archive-order-alert"
import { DeleteOrderAlert } from "@/order/delete/delete-order-alert"
import { useDeleteOrder } from "@/order/delete/use-delete-order"
import { useOrder } from "@/order/hooks"
import { CreateOrderItem } from "@/order/item/components/create-order-item"
import { useOrderUnreadCount } from "@/order/message/read/queries"
import { createOrderOpenAtom } from "@/order/store"
import { UpdateOrder } from "@/order/update/update-order"
import { useUpdateOrder } from "@/order/update/use-update-order"
import { CreateProcurement } from "@/procurement/create/create-procurement"
import {
   createProcurementOpenAtom,
   updateProcurementOpenAtom,
} from "@/procurement/store"
import { CreateAnalog } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/create-analog"
import { OrderItem } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/order-item"
import { Procurement } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/procurement"
import { SeverityCombobox } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/severity-combobox"
import { StatusCombobox } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/status-combobox"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import {
   useMutation,
   useQueryClient,
   useSuspenseQuery,
} from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { makeShortId } from "@unfiddle/core/id"
import { formatOrderDate } from "@unfiddle/core/order/utils"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import { Card } from "@unfiddle/ui/components/card"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Expandable } from "@unfiddle/ui/components/expandable"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { Toggle } from "@unfiddle/ui/components/toggle"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { useAtomValue } from "jotai"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/",
)({
   component: RouteComponent,
})

function RouteComponent() {
   const params = Route.useParams()
   const auth = useAuth()
   const order = useOrder()
   const update = useUpdateOrder()
   const createAssignee = useCreateOrderAssignee()
   const deleteAssignee = useDeleteOrderAssignee()
   const socket = useSocket()
   const queryClient = useQueryClient()

   const pressed = order.assignees.some((a) => a.user.id === auth.user.id)

   const createAttachment = useMutation(
      trpc.attachment.create.mutationOptions(),
   )

   const fileUploaderRef = React.useRef<HTMLDivElement>(null)
   const attachments = useAttachments({
      subjectId: order.id,
      onSuccess: async (data) => {
         const succeeded = data.filter(
            (r): r is UploadedAttachment => !("error" in r),
         )

         createAttachment.mutate(
            {
               attachments: succeeded.map((a) => ({
                  ...a,
                  subjectId: order.id,
                  workspaceId: auth.workspace.id,
                  subjectType: "order",
               })),
               workspaceId: auth.workspace.id,
            },
            {
               onSuccess: (attachment) => {
                  socket.order.send({
                     action: "create_attachement",
                     senderId: auth.user.id,
                     orderId: attachment.subjectId,
                     workspaceId: auth.workspace.id,
                  })
                  queryClient.invalidateQueries(
                     trpc.order.one.queryOptions({
                        orderId: attachment.subjectId,
                        workspaceId: auth.workspace.id,
                     }),
                  )
               },
            },
         )
      },
   })
   const createOrderOpen = useAtomValue(createOrderOpenAtom)
   const createProcurementOpen = useAtomValue(createProcurementOpenAtom)
   const updateProcurementOpen = useAtomValue(updateProcurementOpenAtom)

   const imageAttachments = order.attachments.filter(
      (attachment) =>
         attachment.type.startsWith("image/") &&
         !attachment.name.endsWith(".svg"),
   )

   const unreadCount = useOrderUnreadCount(order.id)

   return (
      <>
         <Header className="md:flex md:pr-1.75">
            <HeaderBackButton />
            <HeaderTitle className="line-clamp-1">
               <span className="md:hidden">Замовлення</span>{" "}
               {makeShortId(order.shortId)}
            </HeaderTitle>
            <Actions />
            <div className="ml-auto flex items-center gap-1.5 max-md:hidden">
               <Tooltip>
                  <TooltipTrigger
                     delay={0}
                     render={
                        <Button
                           kind={"icon"}
                           variant={"secondary"}
                           nativeButton={false}
                           render={
                              <Link
                                 to="/$workspaceId/order/$orderId/chat"
                                 params={params}
                              />
                           }
                        >
                           <Icons.chat className="size-4.75" />
                           {unreadCount === 0 ? null : (
                              <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-red-9" />
                           )}
                        </Button>
                     }
                  />
                  {unreadCount === 0 ? null : (
                     <TooltipPopup>
                        {unreadCount}{" "}
                        {unreadCount === 1
                           ? "нове повідомлення"
                           : "нових повідомлень"}
                     </TooltipPopup>
                  )}
               </Tooltip>
               <Tooltip>
                  <TooltipTrigger
                     render={
                        <Toggle
                           pressed={pressed}
                           render={(props, state) => (
                              <Button
                                 {...props}
                                 kind={"icon"}
                                 variant={"secondary"}
                                 onClick={() => {
                                    if (state.pressed)
                                       return deleteAssignee.mutate({
                                          orderId: order.id,
                                          userId: auth.user.id,
                                          workspaceId: auth.workspace.id,
                                       })

                                    createAssignee.mutate({
                                       orderId: order.id,
                                       userId: auth.user.id,
                                       workspaceId: auth.workspace.id,
                                    })
                                 }}
                              >
                                 {state.pressed ? (
                                    <Icons.undo className="size-4.5" />
                                 ) : (
                                    <Icons.pin className="size-5" />
                                 )}
                              </Button>
                           )}
                        />
                     }
                  />
                  <TooltipPopup>
                     {pressed ? "Залишити" : "Зайняти"}
                  </TooltipPopup>
               </Tooltip>
               <CreateAnalog />
            </div>
         </Header>
         <MainScrollArea>
            {createOrderOpen ||
            createProcurementOpen ||
            updateProcurementOpen ? null : (
               <FileUploader
                  ref={fileUploaderRef}
                  className="absolute inset-0 z-9 h-full"
                  onUpload={attachments.upload.mutateAsync}
               />
            )}
            <Expandable expanded={order.deletedAt !== null}>
               <Badge
                  variant={"destructive"}
                  className="mb-1.5 text-base"
               >
                  <Icons.archive className="mb-0.5 inline-block size-5.5" />
                  Замовлення у архіві
               </Badge>
            </Expandable>
            <SuspenseBoundary
               fallback={null}
               errorComponent={null}
            >
               <TotalProfit />
            </SuspenseBoundary>
            <p className="mt-2 mb-3 font-semibold text-xl md:text-2xl">
               {order.name}
            </p>
            <p className="mb-1 whitespace-pre-wrap">{order.note}</p>
            <ImagesCarousel
               className="mb-1"
               subjectId={order.id}
               images={imageAttachments}
               onDelete={() => {
                  socket.order.send({
                     action: "delete_attachment",
                     senderId: auth.user.id,
                     orderId: order.id,
                     workspaceId: auth.workspace.id,
                  })
                  queryClient.invalidateQueries(
                     trpc.order.one.queryOptions({
                        orderId: order.id,
                        workspaceId: auth.workspace.id,
                     }),
                  )
               }}
            />
            <div className="mt-3 mb-3 flex gap-1 lg:hidden">
               <StatusCombobox />
               <SeverityCombobox />
            </div>
            <div className="mb-6 grid grid-cols-[40%_1fr] gap-y-4 lg:hidden">
               <section className="group/section">
                  <p className="text-muted text-sm">Ціна</p>
                  <p className="mt-1.5 font-medium font-mono text-lg">
                     {order.sellingPrice
                        ? formatCurrency(order.sellingPrice, {
                             currency: order.currency,
                          })
                        : "—"}
                  </p>
               </section>
               <section className="group/section">
                  <p className="text-muted text-sm">Термін постачання</p>
                  <p className="mt-1.5">
                     {order.deliversAt ? formatDate(order.deliversAt) : "—"}
                  </p>
               </section>
               <section className="group/section">
                  <p className="text-muted text-sm">Клієнт</p>
                  <p className="mt-1.5 flex items-center gap-2">
                     {order.client ? (
                        <>
                           <ClientSeverityIcon
                              className="-mb-0.5"
                              severity={order.client.severity}
                           />
                           {order.client.name}
                        </>
                     ) : (
                        "—"
                     )}
                  </p>
               </section>
               <section className="group/section">
                  <p className="text-muted text-sm">Створене</p>
                  <p className="mt-2 flex items-center gap-2">
                     <UserAvatar
                        size={22}
                        user={order.creator}
                     />
                     {order.creator.name} —{" "}
                     {new Date(order.createdAt).getDate() ===
                     new Date().getDate() ? (
                        <span className="max-md:hidden">Сьогодні о</span>
                     ) : null}
                     {formatOrderDate(order.createdAt)}
                  </p>
               </section>
            </div>
            <div className="mt-5">
               <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-lg">Товари</p>
                  <CreateOrderItem>
                     <DrawerTrigger
                        render={
                           <Button variant={"secondary"}>
                              <Icons.plus />
                              Додати
                           </Button>
                        }
                     />
                  </CreateOrderItem>
               </div>
               <div className="relative">
                  {order.items.map((item) => (
                     <OrderItem
                        key={item.id}
                        item={item}
                     />
                  ))}
               </div>
            </div>
            <div className="relative mt-5 min-h-62.5">
               <div className="my-2 flex items-center justify-between">
                  <p className="font-medium text-lg">Закупівлі</p>
                  <CreateProcurement />
               </div>
               <SuspenseBoundary>
                  <Procurements />
               </SuspenseBoundary>
            </div>
            {order.analogs.length === 0 ? null : (
               <div className="mt-5">
                  <div className="my-2 flex items-center justify-between">
                     <p className="font-medium text-lg">Аналоги</p>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-1">
                     {order.analogs.map((name, idx) => (
                        <Card
                           key={name}
                           className="group/analog before:mask-l-from-8 relative flex items-center px-3 py-1.5 before:pointer-events-none before:absolute before:inset-0 before:z-1 before:bg-background before:opacity-0 before:transition-opacity hover:before:opacity-100"
                        >
                           {name}
                           <Button
                              className="absolute right-0.75 z-2 opacity-0 transition-opacity group-hover/analog:opacity-100"
                              size={"sm"}
                              kind={"icon"}
                              variant={"ghost"}
                              onClick={(e) => {
                                 e.stopPropagation()
                                 update.mutate({
                                    orderId: order.id,
                                    workspaceId: params.workspaceId,
                                    analogs: order.analogs.filter(
                                       (_, existingIdx) => existingIdx !== idx,
                                    ),
                                 })
                              }}
                           >
                              <Icons.trash className="size-4" />
                           </Button>
                        </Card>
                     ))}
                  </div>
               </div>
            )}
         </MainScrollArea>
      </>
   )
}

function TotalProfit() {
   const params = Route.useParams()
   const order = useOrder()
   const query = useSuspenseQuery(trpc.procurement.list.queryOptions(params))
   const procurements = query.data

   const totalProfit = procurements.reduce(
      (acc, p) =>
         acc + ((order.sellingPrice ?? 0) - p.purchasePrice) * p.quantity,
      0,
   )

   return (
      <Expandable expanded={order.status === "successful"}>
         <Badge
            variant={"success"}
            className="mb-1.5 text-base"
         >
            <Icons.checkAll className="size-5" />
            Замовлення успішне. Профіт:{" "}
            {`${formatCurrency(totalProfit as number, {
               currency: order.currency,
            })}`}{" "}
         </Badge>
      </Expandable>
   )
}

function Actions() {
   const params = Route.useParams()
   const auth = useAuth()
   const order = useOrder()
   const update = useUpdateOrder()
   const deleteItem = useDeleteOrder()

   const [editOpen, setEditOpen] = React.useState(false)
   const [archiveAlertOpen, setArchiveAlertOpen] = React.useState(false)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="md:ml-2"
                  >
                     <Icons.ellipsisHorizontal />
                  </Button>
               }
            />
            <MenuPopup align="start">
               <MenuItem
                  onClick={() => {
                     setEditOpen(true)
                  }}
               >
                  <Icons.pencil />
                  Редагувати
               </MenuItem>
               {order.deletedAt === null ? (
                  <MenuItem
                     destructive
                     onClick={() => setArchiveAlertOpen(true)}
                  >
                     <Icons.archive />
                     Архівувати
                  </MenuItem>
               ) : (
                  <MenuItem
                     onClick={() =>
                        update.mutate({
                           orderId: order.id,
                           workspaceId: params.workspaceId,
                           deletedAt: null,
                        })
                     }
                  >
                     <Icons.undo />
                     Відновити
                  </MenuItem>
               )}
               {order.deletedAt &&
               (auth.workspace.role === "owner" ||
                  auth.workspace.role === "admin") ? (
                  <MenuItem
                     destructive
                     onClick={() => setDeleteAlertOpen(true)}
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               ) : null}
            </MenuPopup>
         </Menu>
         <UpdateOrder
            open={editOpen}
            setOpen={setEditOpen}
            orderId={order.id}
            finalFocus={menuTriggerRef}
         />
         <ArchiveOrderAlert
            open={archiveAlertOpen}
            onOpenChange={setArchiveAlertOpen}
            orderName={order.name}
            finalFocus={menuTriggerRef}
            action={() =>
               update.mutate({
                  orderId: order.id,
                  workspaceId: params.workspaceId,
                  deletedAt: new Date(),
               })
            }
         />
         <DeleteOrderAlert
            open={deleteAlertOpen}
            onOpenChange={setDeleteAlertOpen}
            orderName={order.name}
            finalFocus={menuTriggerRef}
            action={() =>
               deleteItem.mutate({
                  orderId: order.id,
                  workspaceId: params.workspaceId,
               })
            }
         />
      </>
   )
}

function Procurements() {
   const params = Route.useParams()
   const query = useSuspenseQuery(trpc.procurement.list.queryOptions(params))

   if (query.data.length === 0)
      return <p className="font-medium text-muted">Ще немає закупівель.</p>

   return (
      <Card className="relative mt-2 p-0">
         {query.data.map((p) => (
            <Procurement
               key={p.id}
               procurement={p}
            />
         ))}
      </Card>
   )
}
