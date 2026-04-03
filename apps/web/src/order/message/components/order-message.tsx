import { Message } from "@/chat/components/message"
import { useParams } from "@tanstack/react-router"
import { formatDate } from "@unfiddle/core/date"
import type {
   OrderMessagePosition,
   OrderMessage as OrderMessageType,
} from "@unfiddle/core/order/message/types"

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
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   })
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
            className={
               prevMessage?.creatorId !== message.creatorId ? "mt-3" : ""
            }
            subjectId={params.orderId}
         />
      </>
   )
}
