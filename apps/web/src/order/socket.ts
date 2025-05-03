import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useCreateOrderQueryData } from "@/order/mutations/create"
import { useDeleteOrderQueryData } from "@/order/mutations/delete"
import { useUpdateOrderQueryData } from "@/order/mutations/update"
import type { OrderEvent } from "@ledgerblocks/core/order/types"
import usePartySocket from "partysocket/react"

export function useOrderSocket() {
   const auth = useAuth()
   const create = useCreateOrderQueryData()
   const update = useUpdateOrderQueryData()
   const deleteOrder = useDeleteOrderQueryData()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "order",
      room: auth.workspace.id,
      onMessage(event) {
         const data = JSON.parse(event.data) as OrderEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create")
            return create.mutate({ input: data.order })

         if (data.action === "update")
            return update.mutate({ input: data.order })

         if (data.action === "delete")
            return deleteOrder.mutate({
               input: {
                  id: data.orderId,
                  workspaceId: auth.workspace.id,
               },
            })
      },
   })
}
