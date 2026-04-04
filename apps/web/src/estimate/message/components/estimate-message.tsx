import { useAuth } from "@/auth/hooks"
import {
   Message,
   MessageActions,
   MessageBubble,
   MessageDeleteAction,
   MessageEditAction,
   MessageReplyAction,
} from "@/chat/components/message"
import type { ChatMessagePosition } from "@/chat/types"
import { useDeleteEstimateMessage } from "@/estimate/message/mutations"
import { UserAvatar } from "@/user/components/user-avatar"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "@unfiddle/core/date"
import type { EstimateMessage as EstimateMessageType } from "@unfiddle/core/estimate/message/types"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { cn } from "@unfiddle/ui/utils"

export function EstimateMessage({
   message,
   prevMessage,
   position,
   onReply,
}: {
   message: EstimateMessageType
   prevMessage?: EstimateMessageType
   nextMessage?: EstimateMessageType
   position: ChatMessagePosition
   onReply: () => void
}) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout/chat",
   })
   const auth = useAuth()

   const aWhile = 10 * 60 * 1000 // 10 min

   const isFirstMessageInAWhile =
      !prevMessage ||
      new Date(message.createdAt).getTime() -
         new Date(prevMessage.createdAt).getTime() >
         aWhile

   const viewerIsSender = message.creatorId === auth.user.id

   const hasAvatar =
      (position === "last" || position === "only") && !viewerIsSender

   const deleteMessage = useDeleteEstimateMessage()

   return (
      <>
         {isFirstMessageInAWhile ? (
            <span className="mx-auto mt-7 mb-4 block w-fit text-center text-muted text-xs">
               {formatDate(message.createdAt, { timeStyle: "short" })}
            </span>
         ) : null}
         <div
            data-viewer-is-sender={viewerIsSender ? "" : undefined}
            className={cn(
               "flex w-full gap-2 not-data-viewer-is-sender:pl-2 data-viewer-is-sender:items-end data-viewer-is-sender:pr-2",
               prevMessage?.creatorId !== message.creatorId ? "mt-3" : "",
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
            <Message
               message={message}
               hasAvatar={hasAvatar}
            >
               <MessageActions>
                  <MessageReplyAction onClick={() => onReply()} />
                  {!viewerIsSender ? null : (
                     <>
                        <MessageEditAction subjectId={params.estimateId} />
                        <MessageDeleteAction
                           onClick={() => deleteMessage(message.id)}
                        />
                     </>
                  )}
               </MessageActions>
               <MessageBubble position={position} />
            </Message>
         </div>
      </>
   )
}
