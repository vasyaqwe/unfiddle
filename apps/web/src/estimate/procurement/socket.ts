import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateEstimateProcurement } from "@/estimate/procurement/mutations/use-create-estimate-procurement"
import { useOptimisticDeleteEstimateProcurement } from "@/estimate/procurement/mutations/use-delete-estimate-procurement"
import { useOptimisticUpdateEstimateProcurement } from "@/estimate/procurement/mutations/use-update-estimate-procurement"
import type { EstimateProcurementEvent } from "@unfiddle/core/estimate/procurement/types"
import usePartySocket from "partysocket/react"

export function useEstimateProcurementSocket() {
   const auth = useAuth()
   const create = useOptimisticCreateEstimateProcurement()
   const update = useOptimisticUpdateEstimateProcurement()
   const deleteEstimateProcurement = useOptimisticDeleteEstimateProcurement()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "estimate-procurement",
      room: auth.workspace.id,
      onMessage(event) {
         const data = JSON.parse(event.data) as EstimateProcurementEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create") return create(data.estimateProcurement)
         if (data.action === "update") return update(data.estimateProcurement)
         if (data.action === "delete") return deleteEstimateProcurement(data)

         // if (data.action === "delete_attachment") {
         //    queryClient.invalidateQueries(
         //       trpc.estimateProcurement.list.queryOptions({
         //          estimateId: data.estimateId,
         //          workspaceId: data.workspaceId,
         //       }),
         //    )
         // }
      },
   })
}
