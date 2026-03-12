import { useAuth } from "@/auth/hooks"
import { UserAvatar } from "@/user/components/user-avatar"
import type {
   OrderMessage,
   OrderMessagePosition,
} from "@unfiddle/core/order/message/types"

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

   let normalizedPosition = position

   if (message.attachments.length > 0 && !!message.content) {
      if (normalizedPosition === "only") {
         normalizedPosition = "last"
      } else if (normalizedPosition === "first") {
         normalizedPosition = "middle"
      }
   }

   const roundedClasses = getBorderRadiusClasses(
      normalizedPosition,
      viewerIsSender,
   )

   return (
      <div
         data-viewer-is-sender={viewerIsSender ? "" : undefined}
         className={"flex flex-col items-start data-viewer-is-sender:items-end"}
      >
         <div className="flex w-full gap-2">
            {shouldRenderAvatar && (
               <span className="-translate-y-1 self-end">
                  <UserAvatar user={message.user} />
               </span>
            )}

            <div
               className={cn(
                  "group/bubble relative flex flex-1 flex-col transition-opacity",
                  {
                     "items-end": message.viewer_is_sender,
                     "items-start": !message.viewer_is_sender,
                     "mb-0.5": true,
                  },
               )}
            >
               <div
                  className={cn(
                     "relative flex w-full max-w-[80%] flex-1 flex-col items-end gap-0.5",
                     !message.viewer_is_sender && "items-start",
                     !!message.call && "max-w-full",
                     {},
                  )}
               >
                  {(!!message.content || message.call) && (
                     <div
                        className={cn(
                           "flex w-full items-center justify-end gap-1.5",
                           !message.viewer_is_sender && "flex-row-reverse",
                        )}
                     >
                        {message.call && (
                           <MessageCallBubble
                              call={message.call}
                              className={roundedClasses}
                           />
                        )}

                        {!!message.content && (
                           <TextBubble
                              message={message}
                              position={position}
                              className={roundedClasses}
                           />
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
