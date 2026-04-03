import { formatDate } from "@unfiddle/core/date"
import type { OrderMessagePosition } from "@unfiddle/core/order/message/types"
import * as R from "remeda"

type MessageRow<T> =
   | {
        type: "date"
        key: string
        value: string
        message: undefined
        prevMessage: undefined
        nextMessage: undefined
        position: undefined
     }
   | {
        type: "message"
        key: string
        value: undefined
        message: T
        prevMessage: T | undefined
        nextMessage: T | undefined
        position: OrderMessagePosition
     }

type MessageLike = {
   id: string
   createdAt: Date
   creatorId: string
}

export function groupMessages<T extends MessageLike>(
   messages: T[],
): MessageRow<T>[] {
   const groupedMessages = R.groupBy(messages, (m) => formatDate(m.createdAt))

   return Object.entries(groupedMessages).flatMap(([date, dateMessages]) => {
      return [
         {
            type: "date" as const,
            key: `date-${date}`,
            value: date,
            message: undefined,
            prevMessage: undefined,
            nextMessage: undefined,
            position: undefined,
         },
         ...dateMessages.map((message, messageIdx) => {
            const prev = dateMessages[messageIdx - 1]
            const next = dateMessages[messageIdx + 1]

            const aWhile = 10 * 60 * 1000 // 10 min
            const isFirstMessageInAWhile =
               !prev ||
               new Date(message.createdAt).getTime() -
                  new Date(prev.createdAt).getTime() >
                  aWhile
            const nextIsFirstMessageInAWhile =
               next &&
               new Date(next.createdAt).getTime() -
                  new Date(message.createdAt).getTime() >
                  aWhile

            const sameSenderAsPrev =
               prev?.creatorId === message.creatorId && !isFirstMessageInAWhile
            const sameSenderAsNext =
               next?.creatorId === message.creatorId &&
               !nextIsFirstMessageInAWhile

            let position: OrderMessagePosition
            if (!sameSenderAsPrev && !sameSenderAsNext) {
               position = "only"
            } else if (!sameSenderAsPrev) {
               position = "first"
            } else if (!sameSenderAsNext) {
               position = "last"
            } else {
               position = "middle"
            }

            return {
               type: "message" as const,
               key: message.id,
               value: undefined,
               message,
               prevMessage: prev,
               nextMessage: next,
               position,
            }
         }),
      ]
   })
}
