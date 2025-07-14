import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useOptimisticDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { useOptimisticCreateOrder } from "@/order/mutations/use-create-order"
import { useOptimisticDeleteOrder } from "@/order/mutations/use-delete-order"
import { useOptimisticUpdateOrder } from "@/order/mutations/use-update-order"
import type { OrderEvent } from "@unfiddle/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
   const auth = useAuth()
   const create = useOptimisticCreateOrder()
   // because we're adding/removing items on lists that might not have been loaded (like archived list), we need to invalidate them
   const update = useOptimisticUpdateOrder({ invalidate: true })
   const deleteOrder = useOptimisticDeleteOrder()
   const createAssignee = useOptimisticCreateOrderAssignee()
   const deleteAssignee = useOptimisticDeleteOrderAssignee()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "order",
      room: auth.workspace.id,
      onMessage(event) {
         const data = JSON.parse(event.data) as OrderEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create_assignee") {
            update({ id: data.orderId, status: "processing" })
            return createAssignee({
               orderId: data.orderId,
               assignee: data.assignee,
            })
         }

         if (data.action === "delete_assignee")
            return deleteAssignee({
               orderId: data.orderId,
               userId: data.userId,
            })

         if (data.action === "create") return create(data.order)

         if (data.action === "update") return update(data.order)

         if (data.action === "delete")
            return deleteOrder({
               id: data.orderId,
               workspaceId: auth.workspace.id,
            })
      },
   })
}
