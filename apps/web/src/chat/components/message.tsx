import { useAuth } from "@/auth/hooks"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/chat/store"
import type { ChatMessagePosition } from "@/chat/types"
import { FileItem } from "@/file/components/file-item"
import { getBorderRadiusClasses } from "@/order/message/utils"
import { useNavigate } from "@tanstack/react-router"
import { formatDate } from "@unfiddle/core/date"
import type { OrderMessage as OrderMessageType } from "@unfiddle/core/order/message/types"
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

const MessageContext = React.createContext<{
   message: OrderMessageType
} | null>(null)

function useMessageContext() {
   const context = React.use(MessageContext)
   if (!context) {
      throw new Error("useMessageContext must be used within a MessageContent")
   }
   return context
}

export function Message({
   message,
   hasAvatar,
   children,
}: {
   message: OrderMessageType
   hasAvatar?: boolean
   children: React.ReactNode
}) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id

   return (
      <MessageContext value={{ message }}>
         <div
            data-has-avatar={hasAvatar ? "" : undefined}
            data-viewer-is-sender={viewerIsSender ? "" : undefined}
            className={
               "group/message relative mb-0.5 not-data-has-avatar:ml-10 flex min-w-0 flex-1 flex-col items-start transition-opacity data-viewer-is-sender:items-end"
            }
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
      </MessageContext>
   )
}

export function MessageActions({ children }: { children?: React.ReactNode }) {
   const auth = useAuth()
   const ctx = useMessageContext()
   const viewerIsSender = ctx.message.creatorId === auth.user.id

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
               {children}
            </MenuPopup>
         </Menu>
      </div>
   )
}

export function MessageReplyAction({
   onClick,
   ...props
}: React.ComponentProps<typeof MenuItem>) {
   const ctx = useMessageContext()
   const setReplyingToMessageId = useSetAtom(replyingToMessageIdAtom)

   return (
      <MenuItem
         onClick={(e) => {
            onClick?.(e)
            setReplyingToMessageId(ctx.message.id)
            const contentEl = document.querySelector(
               "[data-chat-content]",
            ) as HTMLTextAreaElement | null
            setTimeout(() => {
               contentEl?.focus()
            }, 1)
         }}
         {...props}
      >
         <Icons.arrowDownLeft />
         Відповісти
      </MenuItem>
   )
}

export function MessageEditAction({
   subjectId,
   ...props
}: React.ComponentProps<typeof MenuItem> & {
   subjectId: string
}) {
   const ctx = useMessageContext()
   const setEditingMessageId = useSetAtom(editingMessageIdAtom)
   const setContent = useSetAtom(messageContentAtom)

   return (
      <MenuItem
         onClick={() => {
            setEditingMessageId(ctx.message.id)
            setContent((prev) => ({
               ...prev,
               [subjectId]: ctx.message.content,
            }))
            const contentEl = document.querySelector(
               "[data-chat-content]",
            ) as HTMLTextAreaElement | null
            setTimeout(() => {
               contentEl?.focus()
            }, 1)
         }}
         {...props}
      >
         <Icons.pencil />
         Редагувати
      </MenuItem>
   )
}

export function MessageDeleteAction(
   props: React.ComponentProps<typeof MenuItem>,
) {
   return (
      <MenuItem
         destructive
         {...props}
      >
         <Icons.trash />
         Видалити
      </MenuItem>
   )
}

export function MessageBubble({ position }: { position: ChatMessagePosition }) {
   const auth = useAuth()
   const ctx = useMessageContext()
   const viewerIsSender = ctx.message.creatorId === auth.user.id

   let normalizedPosition = position
   let replyPosition: ChatMessagePosition = "first"

   if (ctx.message.reply && !!ctx.message.content) {
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
         {ctx.message.reply && (
            <div
               className={cn(
                  "bg-surface-5 px-3.5 py-2 text-xs opacity-80 lg:px-3",
                  replyRoundedClasses,
               )}
            >
               <div className="flex items-center gap-1 font-medium">
                  <Icons.arrowDownLeft className="mt-0.5 size-3 shrink-0" />
                  {ctx.message.reply.creator.name}
               </div>
               <div className="line-clamp-1">
                  {ctx.message.reply.content.length === 0
                     ? null
                     : ctx.message.reply.content}
               </div>
            </div>
         )}
         {ctx.message.content && (
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
                  {ctx.message.content}
               </TooltipTrigger>
               <TooltipPopup>
                  {formatDate(ctx.message.createdAt, {
                     dateStyle: "long",
                     timeStyle: "short",
                  })}
               </TooltipPopup>
            </Tooltip>
         )}
         {ctx.message.attachments && ctx.message.attachments.length > 0 && (
            <MessageAttachments />
         )}
      </div>
   )
}

function MessageAttachments() {
   const navigate = useNavigate()
   const auth = useAuth()
   const ctx = useMessageContext()
   const viewerIsSender = ctx.message.creatorId === auth.user.id

   // const auth = useAuth()
   // const socket = useSocket()
   // const queryClient = useQueryClient()
   // const params = useParams({
   //    from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   // })

   const imageAttachments = ctx.message.attachments.filter(
      (attachment) =>
         attachment.type.startsWith("image/") &&
         !attachment.name.endsWith(".svg"),
   )
   const otherAttachments = ctx.message.attachments.filter(
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
                     subjectId={ctx.message.id}
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
