import {
   ArrowUpRight01Icon,
   FileAttachmentIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { ORDER_PAYMENT_TYPES_TRANSLATION } from "@unfiddle/core/order/constants"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@unfiddle/ui/components/avatar-stack"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import { SVGPreview } from "@unfiddle/ui/components/svg-preview"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { useAtomValue } from "jotai"
import * as React from "react"
import { useAttachments, useDownloadAttachment } from "@/attachment/hooks"
import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { ClientSeverityIcon } from "@/client/components/client-severity-icon"
import { FileUploader } from "@/file/components/uploader"
import { Header, HeaderBackButton } from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { useOrder } from "@/order/hooks"
import { createOrderOpenAtom } from "@/order/store"
import {
   createProcurementOpenAtom,
   updateProcurementOpenAtom,
} from "@/procurement/store"
import { SeverityCombobox } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/severity-combobox"
import { StatusCombobox } from "@/routes/_authed/$workspaceId/_layout/(order)/-components/status-combobox"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { SuspenseFallback } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
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
   const order = useOrder()
   const auth = useAuth()
   const socket = useSocket()
   const queryClient = useQueryClient()
   const fileUploaderRef = React.useRef<HTMLDivElement>(null)

   const createAttachment = useMutation(
      trpc.attachment.create.mutationOptions(),
   )

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

   return (
      <div className="flex grow">
         <div className="relative flex grow flex-col">
            {createOrderOpen ||
            createProcurementOpen ||
            updateProcurementOpen ? null : (
               <FileUploader
                  ref={fileUploaderRef}
                  className="absolute inset-0 z-9 h-full"
                  onUpload={attachments.upload.mutateAsync}
               />
            )}
            <Outlet />
         </div>
         <div
            className={
               "relative flex w-full shrink-0 grow flex-col border-neutral bg-surface-1 max-lg:hidden lg:max-w-(--sidepanel-width) lg:border-l xl:[--sidepanel-width:calc(var(--spacing)*76)]"
            }
         >
            <ScrollArea className="px-5 pb-4">
               <div className="flex h-(--header-height) items-center gap-1">
                  <p className="text-muted">Деталі</p>
               </div>
               <section className="group/section flex flex-col py-3">
                  <StatusCombobox />
                  <SeverityCombobox className="mt-2 -ml-2" />
                  {order.assignees.length === 0 ? null : (
                     <AvatarStack
                        size={26}
                        className="mt-3"
                     >
                        {order.assignees.map((assignee) => (
                           <AvatarStackItem key={assignee.user.id}>
                              <Tooltip>
                                 <TooltipTrigger
                                    delay={0}
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
                  <p className="text-muted text-sm">Ціна</p>
                  <p className="mt-1.5 font-medium font-mono text-lg">
                     {order.sellingPrice
                        ? formatCurrency(order.sellingPrice, {
                             currency: order.currency,
                          })
                        : "—"}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Термін постачання</p>
                  <p className="mt-1.5">
                     {order.deliversAt ? formatDate(order.deliversAt) : "—"}
                  </p>
               </section>
               <section className="group/section py-3">
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
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Створене</p>
                  <p className="mt-2 flex items-center gap-2">
                     <Tooltip>
                        <TooltipTrigger
                           delay={0}
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
                        ? `Сьогодні, ${formatDate(order.createdAt, {
                             timeStyle: "short",
                          })}`
                        : formatDate(order.createdAt, {
                             dateStyle: "short",
                             timeStyle: "short",
                          })}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Оплата</p>
                  <p className="mt-2 font-medium">
                     {ORDER_PAYMENT_TYPES_TRANSLATION[order.paymentType]}
                  </p>
               </section>
               <Files fileUploaderRef={fileUploaderRef} />
               {order.crmUrl ? (
                  <section className="group/section py-3">
                     <p className="mb-2 text-muted text-sm">CRM посилання</p>
                     <a
                        href={order.crmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 py-2 font-medium text-sm underline hover:no-underline"
                     >
                        Переглянути замовлення в CRM
                        <HugeiconsIcon
                           icon={ArrowUpRight01Icon}
                           className="size-4 shrink-0"
                        />
                     </a>
                  </section>
               ) : null}
            </ScrollArea>
         </div>
      </div>
   )
}

function Files({
   fileUploaderRef,
}: {
   fileUploaderRef: React.RefObject<HTMLDivElement | null>
}) {
   const order = useOrder()

   const otherAttachments = order.attachments.filter(
      (attachment) =>
         !attachment.type.startsWith("image/") ||
         attachment.name.endsWith(".svg"),
   )

   return (
      <section className="group/section py-4">
         <div className="flex items-center">
            <p className="text-muted">Файли </p>
            <Button
               className="ml-auto"
               kind={"icon"}
               variant={"ghost"}
               size={"xs"}
               onClick={() => fileUploaderRef.current?.click()}
            >
               <HugeiconsIcon icon={Icons.plus} />
            </Button>
         </div>
         <div className={"mt-3 flex flex-col gap-1"}>
            {otherAttachments.length === 0 ? (
               <p className="text-muted text-sm">Немає файлів.</p>
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
         className={
            "group -ml-1.5 grid grid-cols-[1fr_auto] items-center gap-1"
         }
      >
         <Button
            disabled={download.isPending}
            onClick={() => download.mutate([attachment])}
            variant={"ghost"}
            className="cursor-pointer justify-start px-1.5 md:gap-1.5! md:px-1.5"
         >
            {attachment.name.endsWith(".svg") ? (
               <SVGPreview
                  className="size-5"
                  url={attachment.url}
               />
            ) : (
               <HugeiconsIcon
                  icon={FileAttachmentIcon}
                  className="ml-0! size-4.5 shrink-0"
               />
            )}
            <span className="line-clamp-1 text-sm">{attachment.name}</span>
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
               <HugeiconsIcon icon={Icons.trash} />
            </Button>
         ) : (
            <Tooltip>
               <div className={"grid size-7.75 place-items-center"}>
                  <TooltipTrigger
                     delay={0}
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
