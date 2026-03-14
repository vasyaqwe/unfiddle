import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { VList, VListItem } from "@/layout/components/vlist"
import { useOrder } from "@/order/hooks"
import { CreateOrderMessage } from "@/order/message/components/create-order-message"
import { OrderMessage } from "@/order/message/components/order-message"
import { useOrderMessagesQuery } from "@/order/message/queries"
import { createFileRoute } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { formatDate } from "@unfiddle/core/date"
import { makeShortId } from "@unfiddle/core/id"
import type { OrderMessagePosition } from "@unfiddle/core/order/message/types"
import { Badge } from "@unfiddle/ui/components/badge"
import { Separator } from "@unfiddle/ui/components/separator"
import * as React from "react"
import * as R from "remeda"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
)({
   component: RouteComponent,
})

function RouteComponent() {
   const order = useOrder()
   const query = useOrderMessagesQuery(order.id)

   const rows = React.useMemo(() => {
      const groupedMessages = R.groupBy(query.data, (m) =>
         formatDate(m.createdAt),
      )
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
                  prev?.creatorId === message.creatorId &&
                  !isFirstMessageInAWhile
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
   }, [query.data])

   const scrollAreaRef = React.useRef<HTMLDivElement>(null)
   const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => scrollAreaRef.current,
      getItemKey: (index) => rows[index]?.key ?? index,
      estimateSize: () => 80,
      paddingStart: 24,
      overscan: 6,
   })
   const data = virtualizer.getVirtualItems()

   const hasScrolledToBottomRef = React.useRef(false)
   const shouldScrollToBottomRef = React.useRef(false)
   const prevTotalSizeRef = React.useRef(0)

   React.useLayoutEffect(() => {
      if (rows.length > 0 && !hasScrolledToBottomRef.current) {
         requestAnimationFrame(() => {
            virtualizer.scrollToIndex(rows.length - 1, { align: "end" })
            hasScrolledToBottomRef.current = true
         })
      }
   }, [rows.length, virtualizer])

   const totalSize = virtualizer.getTotalSize()
   React.useEffect(() => {
      if (shouldScrollToBottomRef.current && totalSize > prevTotalSizeRef.current) {
         const scrollElement = scrollAreaRef.current
         if (scrollElement) {
            scrollElement.scrollTop = 999999999
         }
         // Keep scrolling until totalSize stabilizes
         const timeoutId = setTimeout(() => {
            shouldScrollToBottomRef.current = false
         }, 100)
         return () => clearTimeout(timeoutId)
      }
      prevTotalSizeRef.current = totalSize
   }, [totalSize])

   return (
      <>
         <Header className="md:flex md:pr-1.75">
            <HeaderBackButton className={"mr-1.5 md:flex"} />
            <HeaderTitle>
               {makeShortId(order.shortId)}{" "}
               <svg
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="-mt-0.5 inline-block size-5 md:size-4"
               >
                  <path
                     d="M12 3.5L4 11.5"
                     stroke="currentColor"
                     strokeWidth="1.33"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  />
               </svg>{" "}
               Чат
            </HeaderTitle>
         </Header>
         <MainScrollArea
            className={"pt-0 lg:pt-0"}
            container={false}
            ref={scrollAreaRef}
         >
            <VList totalSize={virtualizer.getTotalSize() + 24}>
               {data.map((virtualRow) => {
                  const item = rows[virtualRow.index]

                  if (item?.type === "date") {
                     return (
                        <VListItem
                           key={item.key}
                           data-index={virtualRow.index}
                           ref={virtualizer.measureElement}
                           start={virtualRow.start}
                           className="flex items-center"
                        >
                           <Separator className="w-full" />
                           <Badge className="mx-auto rounded-full font-normal">
                              {item.value}
                           </Badge>
                           <Separator className="w-full" />
                        </VListItem>
                     )
                  }

                  if (!item?.message || !item.position) return null

                  return (
                     <VListItem
                        key={item.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        start={virtualRow.start}
                     >
                        <OrderMessage
                           {...item}
                           key={item.key}
                        />
                     </VListItem>
                  )
               })}
               {/* <div
                  className="absolute bottom-0 left-0 h-61 w-full"
                  aria-hidden
               /> */}
            </VList>
         </MainScrollArea>
         <CreateOrderMessage
            onSuccess={() => {
               shouldScrollToBottomRef.current = true
            }}
         />
      </>
   )
}
