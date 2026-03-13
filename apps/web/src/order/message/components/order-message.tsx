import { formatDate } from "@unfiddle/core/date"
import type { OrderMessage as OrderMessageType } from "@unfiddle/core/order/message/types"

export function OrderMessage({
   message,
   prevMessage,
}: {
   message: OrderMessageType
   prevMessage?: OrderMessageType
   nextMessage?: OrderMessageType
}) {
   const aWhile = 5 * 60 * 1000 // 5 min
   const isFirstMessageInAWhile =
      !prevMessage ||
      new Date(message.createdAt).getTime() -
         new Date(prevMessage.createdAt).getTime() >
         aWhile

   return (
      <div>
         {isFirstMessageInAWhile ? (
            <span className="mx-auto mt-7 mb-4 block w-fit text-center text-muted text-xs">
               {formatDate(message.createdAt, { timeStyle: "short" })}
            </span>
         ) : null}
         <p className="line-clamp-1 break-normal">{message.content}</p>
      </div>
   )
}
