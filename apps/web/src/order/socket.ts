import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateOrder } from "@/order/mutations/create"
import { useOptimisticDeleteOrder } from "@/order/mutations/delete"
import { useOptimisticUpdateOrder } from "@/order/mutations/update"
import type { OrderEvent } from "@ledgerblocks/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
   const auth = useAuth()
   const create = useOptimisticCreateOrder()
   const update = useOptimisticUpdateOrder()
   const deleteOrder = useOptimisticDeleteOrder()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "order",
      room: auth.workspace.id,
      onMessage(event) {
         const data = JSON.parse(event.data) as OrderEvent

         if (data.senderId === auth.user.id) return

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
