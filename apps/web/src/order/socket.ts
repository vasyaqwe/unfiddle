import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useOptimisticDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { useOptimisticCreateOrder } from "@/order/create/use-create-order"
import { useOptimisticDeleteOrder } from "@/order/delete/use-delete-order"
import { useOptimisticCreateOrderItem } from "@/order/item/mutations/use-create-order-item"
import { useOptimisticDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { useOptimisticUpdateOrderItem } from "@/order/item/mutations/use-update-order-item"
import { useOptimisticCreateOrderMessage } from "@/order/message/mutations/use-create-order-message"
import { useOptimisticDeleteOrderMessage } from "@/order/message/mutations/use-delete-order-message"
import { useOptimisticUpdateOrderMessage } from "@/order/message/mutations/use-update-order-message"
import { useOptimisticUpdateOrder } from "@/order/update/use-update-order"
import { trpc } from "@/trpc"
import { useQueryClient } from "@tanstack/react-query"
import type { OrderEvent } from "@unfiddle/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
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
   const createMessage = useOptimisticCreateOrderMessage()
   const updateMessage = useOptimisticUpdateOrderMessage()
   const deleteMessage = useOptimisticDeleteOrderMessage()

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

         if (data.action === "create_message")
            return createMessage({
               orderId: data.orderId,
               message: data.message,
            })
         if (data.action === "update_message")
            return updateMessage(data.message)
         if (data.action === "delete_message") return deleteMessage(data)

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
