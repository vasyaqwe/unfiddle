import { useAuth } from "@/auth/hooks"
import { UserAvatar } from "@/user/components/user-avatar"
import type {
   OrderMessage,
   OrderMessagePosition,
} from "@unfiddle/core/order/message/types"
import { cn } from "@unfiddle/ui/utils"

function getBorderRadiusClasses(
   position: OrderMessagePosition,
   viewerIsSender: boolean,
) {
   if (viewerIsSender) {
      switch (position) {
         case "first":
            return "rounded-[18px] rounded-br after:rounded-[18px] after:rounded-br"
         case "middle":
            return "rounded-r rounded-l-[18px] after:rounded-r after:rounded-l-[18px]"
         case "last":
            return "rounded-l-[18px] rounded-tr-[18px] rounded-br-[18px] after:rounded-l-[18px] after:rounded-tr-[18px] after:rounded-br-[18px]"
         case "only":
            return "rounded-[18px] after:rounded-[18px]"
      }
   }
   switch (position) {
      case "first":
         return "rounded-[18px] rounded-bl after:rounded-[18px] after:rounded-bl"
      case "middle":
         return "rounded-l rounded-r-[18px] after:rounded-l after:rounded-r-[18px]"
      case "last":
         return "rounded-r-[18px] rounded-tl rounded-bl-[18px] after:rounded-r-[18px] after:rounded-tl after:rounded-bl-[18px]"
      case "only":
         return "rounded-[18px] after:rounded-[18px]"
   }
}

export function Bubble({
   message,
   position,
}: { message: OrderMessage; position: OrderMessagePosition }) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id
   const shouldRenderAvatar = viewerIsSender

   const normalizedPosition = position

   // if (message.attachments.length > 0 && !!message.content) {
   //    if (normalizedPosition === "only") {
   //       normalizedPosition = "last"
   //    } else if (normalizedPosition === "first") {
   //       normalizedPosition = "middle"
   //    }
   // }

   const roundedClasses = getBorderRadiusClasses(
      normalizedPosition,
      viewerIsSender,
   )

   const hasReactionsOnly = false

   return (
      <div
         data-viewer-is-sender={viewerIsSender ? "" : undefined}
         className={"flex flex-col items-start data-viewer-is-sender:items-end"}
      >
         <div className="flex w-full gap-2">
            {shouldRenderAvatar && (
               <span className="-translate-y-1 self-end">
                  <UserAvatar user={message.creator} />
               </span>
            )}

            <div
               data-viewer-is-sender={viewerIsSender ? "" : undefined}
               className={
                  "group/bubble relative mb-0.5 flex flex-1 flex-col items-start transition-opacity data-viewer-is-sender:items-end"
               }
            >
               <div
                  className={
                     "relative flex w-full max-w-[80%] flex-1 flex-col items-end gap-0.5 group-not-data-viewer-is-sender/bubble:items-start"
                  }
               >
                  {!!message.content && (
                     <div
                        className={
                           "flex w-full items-center justify-end gap-1.5 group-not-data-viewer-is-sender/bubble:flex-row-reverse"
                        }
                     >
                        {!!message.content && (
                           <div
                              className={cn(
                                 "wrap-break-word relative select-text whitespace-pre-wrap",
                                 roundedClasses,
                                 {
                                    "bg-surface-4":
                                       !viewerIsSender && !hasReactionsOnly,
                                    "bg-primary-7 text-white":
                                       viewerIsSender && !hasReactionsOnly,
                                    //  'bg-quaternary text-tertiary': message.discarded_at && !hasReactionsOnly,
                                    "px-3.5 py-2 lg:px-3": !hasReactionsOnly,
                                    //  'ring-2 ring-[--bg-primary]': message.reply && !hasReactionsOnly,
                                    //  'mt-1': hasReactionsOnly && message.reply,
                                    //  'rounded-tr': viewerIsSender && message.reply,
                                    //  'rounded-tl': !viewerIsSender && message.reply,
                                    "viewer-chat-prose": viewerIsSender,
                                 },
                              )}
                              data-reactions-only={hasReactionsOnly}
                           >
                              {message.content}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
