import { useAuth } from "@/auth/hooks"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/chat/store"
import { FileItem } from "@/file/components/file-item"
import { useDeleteOrderMessage } from "@/order/message/mutations"
import { getBorderRadiusClasses } from "@/order/message/utils"
import { UserAvatar } from "@/user/components/user-avatar"
import { useNavigate, useParams } from "@tanstack/react-router"
import { formatDate } from "@unfiddle/core/date"
import type {
   OrderMessagePosition,
   OrderMessage as OrderMessageType,
} from "@unfiddle/core/order/message/types"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { cn } from "@unfiddle/ui/utils"
import { useSetAtom } from "jotai"
import * as React from "react"

const AttachmentLightbox = React.lazy(
   () => import("@/attachment/components/attachment-lightbox"),
)

export function Message({
   message,
   position,
   onReply,
   className,
}: {
   message: OrderMessageType
   position: OrderMessagePosition
   onReply?: () => void
   className?: string
}) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id
   const hasAvatar =
      (position === "last" || position === "only") && !viewerIsSender

   return (
      <div
         data-viewer-is-sender={viewerIsSender ? "" : undefined}
         className={cn(
            "flex w-full gap-2 not-data-viewer-is-sender:pl-2 data-viewer-is-sender:items-end data-viewer-is-sender:pr-2",
            className,
         )}
      >
         {hasAvatar && (
            <Tooltip>
               <TooltipTrigger
                  delay={0}
                  className="-translate-y-1.5 self-end"
               >
                  <UserAvatar
                     size={32}
                     user={message.creator}
                  />
               </TooltipTrigger>
               <TooltipPopup>{message.creator.name}</TooltipPopup>
            </Tooltip>
         )}
         <MessageContent
            data-has-avatar={hasAvatar ? "" : undefined}
            data-viewer-is-sender={viewerIsSender ? "" : undefined}
         >
            <MessageActions
               message={message}
               onReply={onReply}
            />
            <MessageBubble
               message={message}
               position={position}
            />
         </MessageContent>
      </div>
   )
}

export function MessageContent({
   children,
   ...props
}: React.ComponentProps<"div">) {
   return (
      <div
         className={
            "group/message relative mb-0.5 not-data-has-avatar:ml-10 flex min-w-0 flex-1 flex-col items-start transition-opacity data-viewer-is-sender:items-end"
         }
         {...props}
      >
         <div
            className={
               "relative flex w-full max-w-[80%] grow flex-col items-end gap-0.5 group-not-data-viewer-is-sender/message:items-start"
            }
         >
            <div
               className={
                  "flex w-full items-center justify-end gap-1.5 group-not-data-viewer-is-sender/message:flex-row-reverse"
               }
            >
               {children}
            </div>
         </div>
      </div>
   )
}

export function MessageActions({
   message,
   onReply,
}: {
   message: OrderMessageType
   onReply?: () => void
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   })
   const auth = useAuth()
   const deleteMessage = useDeleteOrderMessage()
   const viewerIsSender = message.creatorId === auth.user.id
   const setEditingMessageId = useSetAtom(editingMessageIdAtom)
   const setContent = useSetAtom(messageContentAtom)
   const setReplyingToMessageId = useSetAtom(replyingToMessageIdAtom)

   return (
      <div className="invisible mt-0.5 opacity-0 group-hover/message:visible group-hover/message:opacity-100">
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                  >
                     <Icons.ellipsisHorizontal />
                  </Button>
               }
            />
            <MenuPopup align={viewerIsSender ? "end" : "start"}>
               <MenuItem
                  onClick={() => {
                     setReplyingToMessageId(message.id)
                     onReply?.()
                     const contentEl = document.querySelector(
                        "[data-chat-content]",
                     ) as HTMLTextAreaElement | null
                     setTimeout(() => {
                        contentEl?.focus()
                     }, 1)
                  }}
               >
                  <Icons.arrowDownLeft />
                  Відповісти
               </MenuItem>
               {message.creatorId !== auth.user.id ? null : (
                  <>
                     <MenuItem
                        onClick={() => {
                           setEditingMessageId(message.id)
                           setContent((prev) => ({
                              ...prev,
                              [params.orderId]: message.content,
                           }))
                           const contentEl = document.querySelector(
                              "[data-chat-content]",
                           ) as HTMLTextAreaElement | null
                           setTimeout(() => {
                              contentEl?.focus()
                           }, 1)
                        }}
                     >
                        <Icons.pencil />
                        Редагувати
                     </MenuItem>
                     <MenuItem
                        destructive
                        onClick={() => deleteMessage(message.id)}
                     >
                        <Icons.trash />
                        Видалити
                     </MenuItem>
                  </>
               )}
            </MenuPopup>
         </Menu>
      </div>
   )
}

export function MessageBubble({
   message,
   position,
}: { message: OrderMessageType; position: OrderMessagePosition }) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id

   let normalizedPosition = position
   let replyPosition: OrderMessagePosition = "first"

   if (message.reply && !!message.content) {
      if (normalizedPosition === "only") {
         normalizedPosition = "last"
         replyPosition = "first"
      } else if (normalizedPosition === "first") {
         normalizedPosition = "middle"
         replyPosition = "first"
      } else if (normalizedPosition === "middle") {
         normalizedPosition = "middle"
         replyPosition = "middle"
      } else if (normalizedPosition === "last") {
         normalizedPosition = "last"
         replyPosition = "middle"
      }
   }

   const roundedClasses = getBorderRadiusClasses(
      normalizedPosition,
      viewerIsSender,
   )

   const replyRoundedClasses = getBorderRadiusClasses(
      replyPosition,
      viewerIsSender,
   )

   const hasReactionsOnly = false

   return (
      <div
         className="flex flex-col items-start gap-0.5 data-viewer-is-sender:items-end"
         data-viewer-is-sender={viewerIsSender ? "" : undefined}
      >
         {message.reply && (
            <div
               className={cn(
                  "bg-surface-5 px-3.5 py-2 text-xs opacity-80 lg:px-3",
                  replyRoundedClasses,
               )}
            >
               <div className="flex items-center gap-1 font-medium">
                  <Icons.arrowDownLeft className="mt-0.5 size-3 shrink-0" />
                  {message.reply.creator.name}
               </div>
               <div className="line-clamp-1">
                  {message.reply.content.length === 0
                     ? null
                     : message.reply.content}
               </div>
            </div>
         )}
         {message.content && (
            <Tooltip>
               <TooltipTrigger
                  className={cn(
                     "wrap-anywhere relative select-text whitespace-pre-wrap text-left",
                     roundedClasses,
                     {
                        "bg-surface-4": !viewerIsSender && !hasReactionsOnly,
                        "bg-primary-7 text-white selection:bg-surface-12":
                           viewerIsSender && !hasReactionsOnly,
                        //  'bg-quaternary text-tertiary': message.discarded_at && !hasReactionsOnly,
                        "px-3.5 py-2 lg:px-3": !hasReactionsOnly,
                        //  'ring-2 ring-[--bg-primary]': message.reply && !hasReactionsOnly,
                        //  'rounded-tr': viewerIsSender && message.reply,
                        //  'rounded-tl': !viewerIsSender && message.reply,
                     },
                  )}
               >
                  {message.content}
               </TooltipTrigger>
               <TooltipPopup>
                  {formatDate(message.createdAt, {
                     dateStyle: "long",
                     timeStyle: "short",
                  })}
               </TooltipPopup>
            </Tooltip>
         )}
         {message.attachments && message.attachments.length > 0 && (
            <MessageAttachments message={message} />
         )}
      </div>
   )
}

function MessageAttachments({ message }: { message: OrderMessageType }) {
   const navigate = useNavigate()
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id

   // const auth = useAuth()
   // const socket = useSocket()
   // const queryClient = useQueryClient()
   // const params = useParams({
   //    from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   // })

   const imageAttachments = message.attachments.filter(
      (attachment) =>
         attachment.type.startsWith("image/") &&
         !attachment.name.endsWith(".svg"),
   )
   const otherAttachments = message.attachments.filter(
      (attachment) =>
         !attachment.type.startsWith("image/") ||
         attachment.name.endsWith(".svg"),
   )

   return (
      <>
         {otherAttachments.length > 0 && (
            <div
               data-viewer-is-sender={viewerIsSender ? "" : undefined}
               className="my-px flex flex-wrap gap-1 data-viewer-is-sender:justify-end"
            >
               {otherAttachments.map((attachment) => (
                  <FileItem
                     key={attachment.id}
                     attachment={attachment}
                     subjectId={message.id}
                  />
               ))}
            </div>
         )}
         <React.Suspense fallback={null}>
            <AttachmentLightbox attachments={imageAttachments} />
         </React.Suspense>
         <div
            data-viewer-is-sender={viewerIsSender ? "" : undefined}
            className="flex min-w-0 flex-wrap gap-1 [--base-width:160px] data-viewer-is-sender:justify-end md:[--base-width:220px]"
         >
            {imageAttachments.map((attachment) => {
               const { width, height } = attachment
               const aspectRatio = width && height ? width / height : 1

               return (
                  <img
                     onClick={() => {
                        navigate({
                           to: ".",
                           search: { attachmentId: attachment.id },
                        })
                     }}
                     style={
                        {
                           aspectRatio,
                           "--aspect-ratio": aspectRatio,
                        } as never
                     }
                     key={attachment.id}
                     src={attachment.url}
                     alt={attachment.name}
                     className="w-full max-w-[calc(var(--base-width)*var(--aspect-ratio))] cursor-pointer rounded-xl border border-neutral object-cover transition-opacity hover:opacity-80"
                  />
               )
            })}
         </div>
      </>
   )
}
