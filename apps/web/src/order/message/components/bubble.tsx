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
   // viewerIsSender: bubble on right, small corner on bottom-right
   // !viewerIsSender: bubble on left, small corner on bottom-left
   if (viewerIsSender) {
      switch (position) {
         case "first":
            return "rounded-[18px] rounded-br"
         case "middle":
            return "rounded-l-[18px] rounded-r"
         case "last":
            return "rounded-[18px] rounded-tr"
         case "only":
            return "rounded-[18px]"
      }
   }
   switch (position) {
      case "first":
         return "rounded-[18px] rounded-bl"
      case "middle":
         return "rounded-r-[18px] rounded-l"
      case "last":
         return "rounded-[18px] rounded-tl"
      case "only":
         return "rounded-[18px]"
   }
}

export function Bubble({
   message,
   position,
}: { message: OrderMessage; position: OrderMessagePosition }) {
   const auth = useAuth()
   const viewerIsSender = message.creatorId === auth.user.id
   const hasAvatar =
      (position === "last" || position === "only") && !viewerIsSender

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
         className={
            "flex flex-col items-start not-data-viewer-is-sender:pl-2 data-viewer-is-sender:items-end data-viewer-is-sender:pr-2"
         }
      >
         <div className="flex w-full gap-2">
            {hasAvatar && (
               <span className="-translate-y-1.5 self-end">
                  <UserAvatar
                     size={32}
                     user={message.creator}
                  />
               </span>
            )}

            <div
               data-has-avatar={hasAvatar ? "" : undefined}
               data-viewer-is-sender={viewerIsSender ? "" : undefined}
               className={
                  "group/bubble p relative mb-0.5 not-data-has-avatar:ml-10 flex flex-1 flex-col items-start transition-opacity data-viewer-is-sender:items-end"
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
                                    "bg-primary-7 text-white selection:bg-surface-12":
                                       viewerIsSender && !hasReactionsOnly,
                                    //  'bg-quaternary text-tertiary': message.discarded_at && !hasReactionsOnly,
                                    "px-3.5 py-2 lg:px-3": !hasReactionsOnly,
                                    //  'ring-2 ring-[--bg-primary]': message.reply && !hasReactionsOnly,
                                    //  'mt-1': hasReactionsOnly && message.reply,
                                    //  'rounded-tr': viewerIsSender && message.reply,
                                    //  'rounded-tl': !viewerIsSender && message.reply,
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
