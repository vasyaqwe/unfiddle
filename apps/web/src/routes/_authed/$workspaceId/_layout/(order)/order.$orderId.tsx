import { ImagesCarousel } from "@/attachment/components/images-carousel"
import { useAttachments, useDownloadAttachment } from "@/attachment/hooks"
import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { FileUploader } from "@/file/components/uploader"
import { MainScrollArea } from "@/layout/components/main"
import { useCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { ArchiveOrderAlert } from "@/order/components/archive-order-alert"
import { DeleteOrderAlert } from "@/order/components/delete-order-alert"
import { SeverityIcon } from "@/order/components/severity-icon"
import { UpdateOrder } from "@/order/components/update-order"
import { useOrder } from "@/order/hooks"
import { CreateOrderItem } from "@/order/item/components/create-order-item"
import { useDeleteOrder } from "@/order/mutations/use-delete-order"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import { createOrderOpenAtom } from "@/order/store"
import { CreateProcurement } from "@/procurement/components/create-procurement"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { CreateAnalog } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/create-analog"
import { OrderItem } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/order-item"
import { Procurement } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/procurement"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import {
   SuspenseBoundary,
   SuspenseFallback,
} from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import {
   useMutation,
   useQueryClient,
   useSuspenseQuery,
} from "@tanstack/react-query"
import { notFound } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import {
   ORDER_SEVERITIES,
   ORDER_SEVERITIES_TRANSLATION,
   ORDER_STATUSES,
   ORDER_STATUSES_TRANSLATION,
} from "@unfiddle/core/order/constants"
import {
   formatOrderDate,
   makeShortId,
   orderStatusGradient,
} from "@unfiddle/core/order/utils"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@unfiddle/ui/components/avatar-stack"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import { Card } from "@unfiddle/ui/components/card"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Expandable } from "@unfiddle/ui/components/expandable"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import { SVGPreview } from "@unfiddle/ui/components/svg-preview"
import { Toggle } from "@unfiddle/ui/components/toggle"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { cn, cx } from "@unfiddle/ui/utils"
import { useAtomValue } from "jotai"
import { useTheme } from "next-themes"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId",
)({
   component: RouteComponent,
   loader: async (opts) => {
      const order = await opts.context.queryClient.ensureQueryData(
         opts.context.trpc.order.one.queryOptions(opts.params),
      )
      if (!order) throw notFound()
   },
   pendingComponent: () => {
      return (
         <>
            <Header>
               <HeaderBackButton />
            </Header>
            <SuspenseFallback />
         </>
      )
   },
   errorComponent: ({ error }) => {
      return (
         <>
            <Header>
               <HeaderBackButton />
            </Header>
            <MainScrollArea>
               <ErrorComponent error={error} />
            </MainScrollArea>
         </>
      )
   },
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

   const imageAttachments = order.attachments.filter(
      (attachment) =>
         attachment.type.startsWith("image/") &&
         !attachment.name.endsWith(".svg"),
   )

   return (
      <div className="flex grow">
         <div className="flex grow flex-col">
            <Header className="md:flex">
               <HeaderBackButton />
               <HeaderTitle className="line-clamp-1">
                  <span className="md:hidden">Замовлення</span>{" "}
                  {makeShortId(order.shortId)}
               </HeaderTitle>
               <Actions />
               <div className="ml-auto flex items-center gap-1.5 max-md:hidden">
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
                                       <Icons.undo className="size-[18px]" />
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
               {createOrderOpen ? null : (
                  <FileUploader
                     ref={fileUploaderRef}
                     className="absolute inset-0 z-[9] h-full"
                     onUpload={attachments.upload.mutateAsync}
                  />
               )}
               <Expandable expanded={order.deletedAt !== null}>
                  <Badge
                     variant={"destructive"}
                     className="mb-1.5 text-base"
                  >
                     <Icons.archive className="mb-[2px] inline-block size-5.5" />
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
               <div className="mb-3 flex gap-1 lg:hidden">
                  <StatusCombobox />
                  <SeverityCombobox />
               </div>
               <div className="mb-6 grid grid-cols-[40%_1fr] gap-y-4 lg:hidden">
                  <section className="group/section">
                     <p className="text-foreground/75 text-sm">Ціна</p>
                     <p className="mt-1.5 font-medium font-mono text-lg">
                        {order.sellingPrice
                           ? formatCurrency(order.sellingPrice, {
                                currency: order.currency,
                             })
                           : "—"}
                     </p>
                  </section>
                  <section className="group/section">
                     <p className="text-foreground/75 text-sm">
                        Термін постачання
                     </p>
                     <p className="mt-1.5">
                        {order.deliversAt ? formatDate(order.deliversAt) : "—"}
                     </p>
                  </section>
                  <section className="group/section">
                     <p className="text-foreground/75 text-sm">Клієнт</p>
                     <p className="mt-1.5">{order.client ?? "—"}</p>
                  </section>
                  <section className="group/section">
                     <p className="text-foreground/75 text-sm">Створене</p>
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
                                 <Icons.plus className="md:size-6" />
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
               <div className="relative mt-5">
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
                              className="group/analog before:mask-l-from-[2rem] relative flex items-center px-3 py-1.5 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-background before:opacity-0 before:transition-opacity hover:before:opacity-100"
                           >
                              {name}
                              <Button
                                 className="absolute right-0.75 z-[2] opacity-0 transition-opacity group-hover/analog:opacity-100"
                                 size={"sm"}
                                 kind={"icon"}
                                 variant={"ghost"}
                                 onClick={(e) => {
                                    e.stopPropagation()
                                    update.mutate({
                                       orderId: order.id,
                                       workspaceId: params.workspaceId,
                                       analogs: order.analogs.filter(
                                          (_, existingIdx) =>
                                             existingIdx !== idx,
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
         </div>
         <div
            className={
               "relative flex w-full shrink-0 grow flex-col border-neutral bg-surface-1 max-lg:hidden lg:max-w-[15rem] lg:border-l xl:max-w-[19rem]"
            }
         >
            <ScrollArea className="px-5 pb-4">
               <div className="flex h-(--header-height) items-center gap-1">
                  <p className="text-foreground/75">Деталі</p>
               </div>
               <section className="group/section flex flex-col py-3">
                  <StatusCombobox />
                  <SeverityCombobox className="-ml-2 mt-2 " />
                  {order.assignees.length === 0 ? null : (
                     <AvatarStack
                        size={26}
                        className="mt-3"
                     >
                        {order.assignees.map((assignee) => (
                           <AvatarStackItem key={assignee.user.id}>
                              <Tooltip delay={0}>
                                 <TooltipTrigger
                                    render={
                                       <UserAvatar
                                          size={26}
                                          user={assignee.user}
                                       />
                                    }
                                 />
                                 <TooltipPopup>
                                    {assignee.user.name}
                                 </TooltipPopup>
                              </Tooltip>
                           </AvatarStackItem>
                        ))}
                     </AvatarStack>
                  )}
               </section>
               <section className="group/section py-3">
                  <p className="text-foreground/75 text-sm">Ціна</p>
                  <p className="mt-1.5 font-medium font-mono text-lg">
                     {order.sellingPrice
                        ? formatCurrency(order.sellingPrice, {
                             currency: order.currency,
                          })
                        : "—"}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-foreground/75 text-sm">
                     Термін постачання
                  </p>
                  <p className="mt-1.5">
                     {order.deliversAt ? formatDate(order.deliversAt) : "—"}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-foreground/75 text-sm">Клієнт</p>
                  <p className="mt-1.5">{order.client ?? "—"}</p>
               </section>
               <section className="group/section py-3">
                  <p className="text-foreground/75 text-sm">Створене</p>
                  <p className="mt-2 flex items-center gap-2">
                     <Tooltip delay={0}>
                        <TooltipTrigger
                           render={
                              <UserAvatar
                                 size={22}
                                 user={order.creator}
                              />
                           }
                        />
                        <TooltipPopup>{order.creator.name}</TooltipPopup>
                     </Tooltip>
                     {new Date(order.createdAt).getDate() ===
                     new Date().getDate()
                        ? "Сьогодні о "
                        : ""}
                     {formatOrderDate(order.createdAt)}
                  </p>
               </section>
               {order.vat ? (
                  <section className="group/section py-3">
                     <p className="-ml-1 font-medium text-orange-10">
                        <Icons.check className="mr-1.5 mb-[2px] inline-block size-5.5" />
                        З ПДВ
                     </p>
                  </section>
               ) : null}
               <Files fileUploaderRef={fileUploaderRef} />
            </ScrollArea>
         </div>
      </div>
   )
}

function Files({
   fileUploaderRef,
}: { fileUploaderRef: React.RefObject<HTMLDivElement | null> }) {
   const order = useOrder()

   const otherAttachments = order.attachments.filter(
      (attachment) =>
         !attachment.type.startsWith("image/") ||
         attachment.name.endsWith(".svg"),
   )

   return (
      <section className="group/section py-4">
         <div className="flex items-center">
            <p className="text-foreground/75">Файли </p>
            <Button
               className="ml-auto"
               kind={"icon"}
               variant={"ghost"}
               size={"xs"}
               onClick={() => fileUploaderRef.current?.click()}
            >
               <Icons.plus className="size-4" />
            </Button>
         </div>
         <div className={"mt-3 flex flex-col gap-1"}>
            {otherAttachments.length === 0 ? (
               <p className="text-foreground/60 text-sm">Немає файлів.</p>
            ) : (
               otherAttachments.map((attachment) => (
                  <FileItem
                     attachment={attachment}
                     key={attachment.id}
                  />
               ))
            )}
         </div>
      </section>
   )
}

function FileItem({
   attachment,
}: {
   attachment: NonNullable<RouterOutput["order"]["one"]>["attachments"][number]
}) {
   const auth = useAuth()
   const order = useOrder()
   const download = useDownloadAttachment()
   const deleteItem = useMutation(trpc.attachment.delete.mutationOptions())
   const socket = useSocket()
   const queryClient = useQueryClient()

   return (
      <div
         key={attachment.id}
         className={cx(
            "group -ml-1.5 grid grid-cols-[1fr_auto] items-center gap-1",
         )}
      >
         <Button
            disabled={download.isPending}
            onClick={() => download.mutate([attachment])}
            variant={"ghost"}
            className="md:!gap-1.5 cursor-pointer justify-start px-1.5 md:px-1.5"
         >
            {attachment.name.endsWith(".svg") ? (
               <SVGPreview
                  className="size-5"
                  url={attachment.url}
               />
            ) : (
               <Icons.attachment className="!ml-0" />
            )}
            <span className="line-clamp-1 text-foreground/75 text-sm">
               {attachment.name}
            </span>
         </Button>
         {attachment.creatorId === auth.user.id ? (
            <Button
               kind={"icon"}
               variant={"ghost"}
               className="group-hover:visible md:invisible"
               onClick={async () => {
                  deleteItem.mutate(
                     {
                        attachmentId: attachment.id,
                        workspaceId: auth.workspace.id,
                        subjectId: order.id,
                     },
                     {
                        onSuccess: () => {
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
                        },
                     },
                  )
               }}
               disabled={deleteItem.isPending}
            >
               <Icons.trash />
            </Button>
         ) : (
            <Tooltip delay={0}>
               <div className={"grid size-[31px] place-items-center"}>
                  <TooltipTrigger
                     render={
                        <UserAvatar
                           size={22}
                           user={attachment.creator}
                        />
                     }
                  />
               </div>
               <TooltipPopup>{attachment.creator.name}</TooltipPopup>
            </Tooltip>
         )}
      </div>
   )
}

function SeverityCombobox({ className }: React.ComponentProps<typeof Button>) {
   const params = Route.useParams()
   const order = useOrder()
   const update = useUpdateOrder()

   return (
      <Combobox
         value={order.severity}
         onValueChange={(severity) => {
            update.mutate({
               orderId: order.id,
               workspaceId: params.workspaceId,
               severity: severity as never,
            })
         }}
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"ghost"}
                  className={cn("!gap-1.75 w-fit justify-start", className)}
               >
                  <SeverityIcon
                     severity={order.severity}
                     className="!-ml-[3px]"
                  />
                  {ORDER_SEVERITIES_TRANSLATION[order.severity]}
               </Button>
            }
         />
         <ComboboxPopup
            sideOffset={4}
            align="start"
            side="left"
         >
            <ComboboxInput />
            {ORDER_SEVERITIES.map((s) => (
               <ComboboxItem
                  key={s}
                  value={s}
                  keywords={[ORDER_SEVERITIES_TRANSLATION[s]]}
               >
                  {ORDER_SEVERITIES_TRANSLATION[s]}
               </ComboboxItem>
            ))}
         </ComboboxPopup>
      </Combobox>
   )
}

function StatusCombobox() {
   const params = Route.useParams()
   const order = useOrder()
   const theme = useTheme()
   const update = useUpdateOrder()

   const [from, to] = orderStatusGradient(
      order.status ?? "canceled",
      theme.resolvedTheme ?? "light",
   )

   return (
      <Combobox
         canBeEmpty
         value={order.status}
         onValueChange={(status) => {
            if (order.status === status)
               return update.mutate({
                  orderId: order.id,
                  workspaceId: params.workspaceId,
                  status: "pending",
               })

            update.mutate({
               orderId: order.id,
               workspaceId: params.workspaceId,
               status: status as never,
            })
         }}
      >
         <ComboboxTrigger
            render={
               <Button
                  variant={"ghost"}
                  className="-ml-2 w-fit justify-start gap-2.5"
               >
                  <Badge
                     className="size-3.5 shrink-0 rounded-full px-0"
                     style={{
                        background: `linear-gradient(140deg, ${from}, ${to})`,
                     }}
                  />
                  {ORDER_STATUSES_TRANSLATION[order.status] ??
                     "Без статусу"}{" "}
               </Button>
            }
         />
         <ComboboxPopup
            sideOffset={4}
            align="start"
            side="left"
         >
            <ComboboxInput />
            {ORDER_STATUSES.map((s) =>
               s === "pending" ? null : (
                  <ComboboxItem
                     key={s}
                     value={s}
                     keywords={[ORDER_STATUSES_TRANSLATION[s]]}
                  >
                     {ORDER_STATUSES_TRANSLATION[s]}
                  </ComboboxItem>
               ),
            )}
         </ComboboxPopup>
      </Combobox>
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
            order={order}
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
      return (
         <p className="font-medium text-foreground/75">Ще немає закупівель.</p>
      )

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
