import { useAuth } from "@/auth/hooks"
import { useDeleteOrderMessage } from "@/order/message/mutations"
import { getBorderRadiusClasses } from "@/order/message/utils"
import { UserAvatar } from "@/user/components/user-avatar"
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

export function OrderMessage({
   message,
   prevMessage,
   position,
}: {
   message: OrderMessageType
   prevMessage?: OrderMessageType
   nextMessage?: OrderMessageType
   position: OrderMessagePosition
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
         <Bubble
            message={message}
            position={position}
         />
      </>
   )
}

function Bubble({
   message,
   position,
}: { message: OrderMessageType; position: OrderMessagePosition }) {
   const auth = useAuth()
   const deleteMessage = useDeleteOrderMessage()
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
                     "relative flex w-full max-w-[80%] grow flex-col items-end gap-0.5 group-not-data-viewer-is-sender/bubble:items-start"
                  }
               >
                  {!!message.content && (
                     <div
                        className={
                           "flex w-full items-center justify-end gap-1.5 group-not-data-viewer-is-sender/bubble:flex-row-reverse"
                        }
                     >
                        <div className="invisible mt-0.5 opacity-0 group-hover/bubble:visible group-hover/bubble:opacity-100">
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
                              <MenuPopup
                                 align={viewerIsSender ? "end" : "start"}
                              >
                                 <MenuItem>
                                    <Icons.arrowDownLeft />
                                    Відповісти
                                 </MenuItem>
                                 {message.creatorId !== auth.user.id ? null : (
                                    <MenuItem
                                       destructive
                                       onClick={() => deleteMessage(message.id)}
                                    >
                                       <Icons.trash />
                                       Видалити
                                    </MenuItem>
                                 )}
                              </MenuPopup>
                           </Menu>
                        </div>
                        <Tooltip>
                           <TooltipTrigger
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
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
