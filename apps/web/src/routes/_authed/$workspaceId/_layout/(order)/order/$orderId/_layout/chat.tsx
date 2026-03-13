import { useForceUpdate } from "@/interactions/use-force-update"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { VList, VListContent } from "@/layout/components/vlist"
import { useOrder } from "@/order/hooks"
import { CreateOrderMessage } from "@/order/message/components/create-order-message"
import { OrderMessage } from "@/order/message/components/order-message"
import { useOrderMessagesQuery } from "@/order/message/hooks"
import { createFileRoute } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { formatDate } from "@unfiddle/core/date"
import { makeShortId } from "@unfiddle/core/id"
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

   const groupedMessages = R.groupBy(query.data, (m) => formatDate(m.createdAt))
   const rows = Object.entries(groupedMessages).flatMap(
      ([date, dateMessages], idx) => {
         return [
            {
               type: "date",
               value: date,
               message: undefined,
               prevMessage: undefined,
               nextMessage: undefined,
            },
            ...dateMessages.map((message) => ({
               type: "message",
               value: undefined,
               message,
               prevMessage: dateMessages[idx - 1],
               nextMessage: dateMessages[idx + 1],
            })),
         ]
      },
   )

   const scrollAreaRef = React.useRef<HTMLDivElement>(null)
   const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: () => {
         return window.innerWidth < 1024 ? 72 : 44
      },
      overscan: 6,
   })
   const data = virtualizer.getVirtualItems()
   useForceUpdate()

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
            <VList
               className="relative mb-20 w-full"
               totalSize={virtualizer.getTotalSize()}
            >
               <VListContent start={data[0]?.start ?? 0}>
                  {data.map((_row, idx) => {
                     const item = rows[idx]

                     if (item?.type === "date") {
                        return (
                           <div
                              key={idx}
                              className="mx-auto w-full max-w-4xl px-3 sm:px-4"
                           >
                              <div>{item.value}</div>
                           </div>
                        )
                     }

                     if (!item?.message) return <div />

                     return (
                        <div
                           key={idx}
                           className="mx-auto w-full max-w-4xl px-3 sm:px-4"
                        >
                           <OrderMessage {...item} />
                        </div>
                     )
                  })}
               </VListContent>
            </VList>
         </MainScrollArea>
         <CreateOrderMessage />
      </>
   )
}
