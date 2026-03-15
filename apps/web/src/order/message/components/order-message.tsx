import { useAuth } from "@/auth/hooks"
import { useDeleteOrderMessage } from "@/order/message/mutations"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/order/message/store"
import { getBorderRadiusClasses } from "@/order/message/utils"
import { UserAvatar } from "@/user/components/user-avatar"
import { useParams } from "@tanstack/react-router"
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

export function OrderMessage({
   message,
   prevMessage,
   position,
   onReply,
}: {
   message: OrderMessageType
   prevMessage?: OrderMessageType
   nextMessage?: OrderMessageType
   position: OrderMessagePosition
   onReply?: () => void
}) {
   const aWhile = 10 * 60 * 1000 // 10 min
   const isFirstMessageInAWhile =
      !prevMessage ||
      new Date(message.createdAt).getTime() -
         new Date(prevMessage.createdAt).getTime() >
         aWhile

   return (
      <>
         {isFirstMessageInAWhile ? (
            <span className="mx-auto mt-7 mb-4 block w-fit text-center text-muted text-xs">
               {formatDate(message.createdAt, { timeStyle: "short" })}
            </span>
         ) : null}
         <Message
            message={message}
            position={position}
            onReply={onReply}
         />
      </>
   )
}

function Message({
   message,
   position,
   onReply,
}: {
   message: OrderMessageType
   position: OrderMessagePosition
   onReply?: () => void
}) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id
   const hasAvatar =
      (position === "last" || position === "only") && !viewerIsSender

   return (
      <div
         data-viewer-is-sender={viewerIsSender ? "" : undefined}
         className={
            "flex w-full gap-2 not-data-viewer-is-sender:pl-2 data-viewer-is-sender:items-end data-viewer-is-sender:pr-2"
         }
      >
         {hasAvatar && (
            <span className="-translate-y-1.5 self-end">
               <UserAvatar
                  size={32}
                  user={message.creator}
               />
            </span>
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

function MessageContent({ children, ...props }: React.ComponentProps<"div">) {
   return (
      <div
         className={
            "group/message relative mb-0.5 not-data-has-avatar:ml-10 flex flex-1 flex-col items-start transition-opacity data-viewer-is-sender:items-end"
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

function MessageActions({
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

function MessageBubble({
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
               <div className="line-clamp-1">{message.reply.content}</div>
            </div>
         )}
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
      </div>
   )
}
