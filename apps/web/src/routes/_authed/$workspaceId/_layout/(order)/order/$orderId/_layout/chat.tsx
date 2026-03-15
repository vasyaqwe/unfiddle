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
import {
   useInitialScrollToBottom,
   useOnMessageDelete,
   useOnMessageInsert,
} from "@/order/message/hooks"
import { useOrderMessagesQuery } from "@/order/message/queries"
import { editingMessageIdAtom } from "@/order/message/store"
import { createFileRoute } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { formatDate } from "@unfiddle/core/date"
import { makeShortId } from "@unfiddle/core/id"
import type { OrderMessagePosition } from "@unfiddle/core/order/message/types"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Separator } from "@unfiddle/ui/components/separator"
import { useAtomValue } from "jotai"
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
   const [unreadCount, setUnreadCount] = React.useState(0)
   const editingMessageId = useAtomValue(editingMessageIdAtom)

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

   useInitialScrollToBottom(virtualizer, rows.length)
   useOnMessageInsert(rows, (viewerIsSender) => {
      if (viewerIsSender)
         return virtualizer.scrollToIndex(rows.length - 1, {
            align: "end",
            behavior: "smooth",
         })

      const scrollElement = scrollAreaRef.current

      if (scrollElement) {
         const isAtBottom =
            scrollElement.scrollHeight -
               scrollElement.scrollTop -
               scrollElement.clientHeight <
            100

         if (isAtBottom)
            return virtualizer.scrollToIndex(rows.length - 1, {
               align: "end",
               behavior: "smooth",
            })

         setUnreadCount((prev) => prev + 1)
      }
   })
   useOnMessageDelete(rows, (viewerIsSender) => {
      if (viewerIsSender) return
      setUnreadCount((prev) => prev - 1)
   })

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
            onScroll={(e) => {
               const scrollElement = e.currentTarget
               const isAtBottom =
                  scrollElement.scrollHeight -
                     scrollElement.scrollTop -
                     scrollElement.clientHeight <
                  10

               if (isAtBottom && unreadCount > 0) {
                  setUnreadCount(0)
               }
            }}
         >
            {unreadCount === 0 ? null : (
               <Button
                  variant={"tertiary"}
                  className={
                     "fixed bottom-18 left-[calc(var(--sidebar-width)+1rem)] z-50 w-fit border-transparent bg-red-11 font-medium text-white shadow-md hover:bg-red-10 active:bg-red-11"
                  }
                  onClick={() => {
                     virtualizer.scrollToIndex(rows.length - 1, {
                        align: "end",
                     })
                     setUnreadCount(0)
                  }}
               >
                  <Icons.arrowDown className="size-4" />
                  {unreadCount}
               </Button>
            )}
            <VList totalSize={virtualizer.getTotalSize() + 24}>
               {editingMessageId ? (
                  <div className="absolute inset-0 z-75 bg-background/60" />
               ) : null}
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
                        className={
                           item.message.id === editingMessageId
                              ? "z-100"
                              : undefined
                        }
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
         <CreateOrderMessage />
      </>
   )
}
