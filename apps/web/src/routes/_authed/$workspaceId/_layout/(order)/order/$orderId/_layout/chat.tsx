import { useAuth } from "@/auth/hooks"
import { UnreadCountButton } from "@/chat/components/unread-count-button"
import { editingMessageIdAtom } from "@/chat/store"
import { groupMessages } from "@/chat/utils"
import {
   Header,
   HeaderBackButton,
   HeaderSeparator,
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
import { useMarkMessagesAsRead } from "@/order/message/read/mutations"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { makeShortId } from "@unfiddle/core/id"
import { Badge } from "@unfiddle/ui/components/badge"
import { Separator } from "@unfiddle/ui/components/separator"
import { useTabFocused } from "@unfiddle/ui/hooks/use-tab-focused"
import { useAtomValue } from "jotai"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
)({
   component: RouteComponent,
})

function RouteComponent() {
   const params = Route.useParams()
   const navigate = useNavigate()
   const auth = useAuth()
   const order = useOrder()
   const query = useOrderMessagesQuery(order.id)
   const [unreadCount, setUnreadCount] = React.useState(0)
   const editingMessageId = useAtomValue(editingMessageIdAtom)
   const tabFocused = useTabFocused()
   const readMessages = useMarkMessagesAsRead(order.id)

   const rows = React.useMemo(() => groupMessages(query.data), [query.data])

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

   React.useEffect(() => {
      if (!tabFocused) return

      readMessages.mutate({ orderId: order.id, workspaceId: auth.workspace.id })
   }, [tabFocused])

   useInitialScrollToBottom(virtualizer, rows.length)
   useOnMessageInsert(rows, (viewerIsSender) => {
      if (viewerIsSender)
         return virtualizer.scrollToIndex(rows.length - 1, {
            align: "end",
            behavior: "smooth",
         })

      const scrollElement = scrollAreaRef.current

      if (scrollElement) {
         const isScrollable =
            scrollElement.scrollHeight > scrollElement.clientHeight

         if (!isScrollable) return

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
      if (unreadCount === 0) return
      setUnreadCount((prev) => prev - 1)
   })

   return (
      <>
         <Header className="md:flex md:px-1.75">
            <HeaderBackButton
               className={"mr-1.5 md:flex"}
               onClick={() =>
                  navigate({ to: "/$workspaceId/order/$orderId", params })
               }
            />
            <HeaderTitle>
               {makeShortId(order.shortId)} <HeaderSeparator />
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
            {!query.isLoading && data.length === 0 ? (
               <p className="absolute inset-0 m-auto size-fit text-muted">
                  Немає повідомлень
               </p>
            ) : null}
            {unreadCount === 0 ? null : (
               <UnreadCountButton
                  onClick={() => {
                     virtualizer.scrollToIndex(rows.length - 1, {
                        align: "end",
                     })
                     setUnreadCount(0)
                  }}
               >
                  {unreadCount}
               </UnreadCountButton>
            )}
            <VList totalSize={virtualizer.getTotalSize() + 24}>
               {editingMessageId ? (
                  <div className="absolute inset-0 z-75 bg-background/60" />
               ) : null}
               {query.isLoading
                  ? null
                  : data.map((virtualRow) => {
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
                             data-editing-message-id={
                                editingMessageId === item.message.id
                                   ? ""
                                   : undefined
                             }
                             className={"data-editing-message-id:z-100"}
                          >
                             <OrderMessage
                                {...item}
                                key={item.key}
                                onReply={() => {
                                   const scrollElement = scrollAreaRef.current
                                   if (!scrollElement) return

                                   const isAtBottom =
                                      scrollElement.scrollHeight -
                                         scrollElement.scrollTop -
                                         scrollElement.clientHeight <
                                      100

                                   if (isAtBottom) {
                                      virtualizer.scrollToIndex(
                                         rows.length - 1,
                                         {
                                            align: "end",
                                            behavior: "smooth",
                                         },
                                      )
                                   }
                                }}
                             />
                          </VListItem>
                       )
                    })}
            </VList>
         </MainScrollArea>
         <CreateOrderMessage />
      </>
   )
}
