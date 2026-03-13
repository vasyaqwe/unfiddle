import { Bubble } from "@/order/message/components/bubble"
import { formatDate } from "@unfiddle/core/date"
import type {
   OrderMessagePosition,
   OrderMessage as OrderMessageType,
} from "@unfiddle/core/order/message/types"

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
