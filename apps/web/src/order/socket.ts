import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { sendNotification } from "@/notification/utils"
import { useOptimisticCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useOptimisticDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { useOptimisticCreateOrder } from "@/order/create/use-create-order"
import { useOptimisticDeleteOrder } from "@/order/delete/use-delete-order"
import { useOptimisticCreateOrderItem } from "@/order/item/mutations/use-create-order-item"
import { useOptimisticDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { useOptimisticUpdateOrderItem } from "@/order/item/mutations/use-update-order-item"
import { orderMessageCollection } from "@/order/message/collection"
import { useOptimisticUpdateOrder } from "@/order/update/use-update-order"
import { trpc } from "@/trpc"
import { useQueryClient } from "@tanstack/react-query"
import { useMatches, useNavigate, useParams } from "@tanstack/react-router"
import type { OrderEvent } from "@unfiddle/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
   const maybeParams = useParams({ strict: false })
   const matches = useMatches()
   const navigate = useNavigate()
   const auth = useAuth()
   const queryClient = useQueryClient()
   const create = useOptimisticCreateOrder()
   const update = useOptimisticUpdateOrder()
   const deleteOrder = useOptimisticDeleteOrder()
   const createAssignee = useOptimisticCreateOrderAssignee()
   const deleteAssignee = useOptimisticDeleteOrderAssignee()
   const createItem = useOptimisticCreateOrderItem()
   const updateItem = useOptimisticUpdateOrderItem()
   const deleteItem = useOptimisticDeleteOrderItem()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "order",
      room: auth.workspace.id,
      async onMessage(event) {
         const data = JSON.parse(event.data) as OrderEvent

         if (data.senderId === auth.user.id) return

         if (
            data.action === "create_attachement" ||
            data.action === "delete_attachment"
         ) {
            return queryClient.invalidateQueries(
               trpc.order.one.queryOptions({
                  orderId: data.orderId,
                  workspaceId: data.workspaceId,
               }),
            )
         }

         if (data.action === "create_item") return createItem(data)
         if (data.action === "update_item") return updateItem(data.item)
         if (data.action === "delete_item") return deleteItem(data)

         if (data.action === "create_message") {
            const collection = orderMessageCollection(
               data.orderId,
               data.workspaceId,
            )

            queryClient.setQueryData(
               trpc.order.message.read.orderUnreadCount.queryKey({
                  orderId: data.orderId,
                  workspaceId: data.workspaceId,
               }),
               (old: { count: number } | undefined) => ({
                  count: (old?.count ?? 0) + 1,
               }),
            )
            queryClient.setQueryData(
               trpc.order.message.read.unreadCount.queryKey({
                  workspaceId: data.workspaceId,
               }),
               (old: { count: number } | undefined) => ({
                  count: (old?.count ?? 0) + 1,
               }),
            )

            collection.utils.writeInsert(data.message)

            if (
               maybeParams.orderId === data.orderId &&
               matches.some(
                  (m) =>
                     m.routeId ===
                     "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
               )
            )
               return

            sendNotification({
               title: data.message.creator.name,
               body: data.message.content,
               icon: data.message.creator.image,
               onClick: () => {
                  navigate({
                     to: "/$workspaceId/order/$orderId/chat",
                     params: {
                        orderId: data.orderId,
                        workspaceId: auth.workspace.id,
                     },
                  })
               },
            })
         }
         if (data.action === "update_message") {
            const collection = orderMessageCollection(
               data.orderId,
               auth.workspace.id,
            )
            return collection.utils.writeUpdate(data.message)
         }
         if (data.action === "delete_message") {
            const collection = orderMessageCollection(
               data.orderId,
               data.workspaceId,
            )
            collection.utils.writeDelete(data.orderMessageId)

            queryClient.invalidateQueries({
               queryKey: trpc.order.message.read.orderUnreadCount.queryKey({
                  orderId: data.orderId,
                  workspaceId: data.workspaceId,
               }),
            })
            queryClient.invalidateQueries({
               queryKey: trpc.order.message.read.unreadCount.queryKey({
                  workspaceId: data.workspaceId,
               }),
            })
         }

         if (data.action === "create_assignee") {
            await update({
               orderId: data.orderId,
               status: "processing",
               workspaceId: data.workspaceId,
            })
            return createAssignee(data)
         }
         if (data.action === "delete_assignee") return deleteAssignee(data)

         if (data.action === "create") return create(data.order)
         if (data.action === "update") return update(data.order)
         if (data.action === "delete") return deleteOrder(data)
      },
   })
}
