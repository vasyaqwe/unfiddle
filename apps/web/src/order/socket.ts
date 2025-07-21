import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useOptimisticDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { useOptimisticCreateOrderItem } from "@/order/item/mutations/use-create-order-item"
import { useOptimisticDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { useOptimisticUpdateOrderItem } from "@/order/item/mutations/use-update-order-item"
import { useOptimisticCreateOrder } from "@/order/mutations/use-create-order"
import { useOptimisticDeleteOrder } from "@/order/mutations/use-delete-order"
import { useOptimisticUpdateOrder } from "@/order/mutations/use-update-order"
import type { OrderEvent } from "@unfiddle/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
   const auth = useAuth()
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

         if (data.action === "create_item") {
            update({ id: data.item.orderId, status: "processing" })
            return createItem(data.item)
         }

         if (data.action === "update_item") return updateItem(data.item)

         if (data.action === "delete_item") return deleteItem(data)

         if (data.action === "create_assignee") {
            await update({ id: data.orderId, status: "processing" })
            return createAssignee(data)
         }

         if (data.action === "delete_assignee") return deleteAssignee(data)

         if (data.action === "create") return create(data.order)

         if (data.action === "update") return update(data.order)

         if (data.action === "delete") return deleteOrder(data)
      },
   })
}
