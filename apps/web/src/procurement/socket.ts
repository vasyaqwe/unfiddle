import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateProcurement } from "@/procurement/mutations/use-create-procurement"
import { useOptimisticDeleteProcurement } from "@/procurement/mutations/use-delete-procurement"
import { useOptimisticUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import { trpc } from "@/trpc"
import { useQueryClient } from "@tanstack/react-query"
import type { ProcurementEvent } from "@unfiddle/core/procurement/types"
import usePartySocket from "partysocket/react"

export function useProcurementSocket() {
   const auth = useAuth()
   const create = useOptimisticCreateProcurement()
   const update = useOptimisticUpdateProcurement()
   const deleteProcurement = useOptimisticDeleteProcurement()
   const queryClient = useQueryClient()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "procurement",
      room: auth.workspace.id,
      onMessage(event) {
         const data = JSON.parse(event.data) as ProcurementEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create") return create(data.procurement)
         if (data.action === "update") return update(data.procurement)
         if (data.action === "delete") return deleteProcurement(data)

         if (data.action === "delete_attachment") {
            queryClient.invalidateQueries(
               trpc.procurement.list.queryOptions({
                  orderId: data.orderId,
                  workspaceId: data.workspaceId,
               }),
            )
         }
      },
   })
}
