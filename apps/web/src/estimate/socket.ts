import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateEstimate } from "@/estimate/mutations/use-create-estimate"
import { useOptimisticDeleteEstimate } from "@/estimate/mutations/use-delete-estimate"
import { useOptimisticUpdateEstimate } from "@/estimate/mutations/use-update-estimate"
import type { EstimateEvent } from "@unfiddle/core/estimate/types"
import usePartySocket from "partysocket/react"

export function useEstimateSocket() {
   const auth = useAuth()
   const create = useOptimisticCreateEstimate()
   const update = useOptimisticUpdateEstimate()
   const deleteEstimate = useOptimisticDeleteEstimate()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "estimate",
      room: auth.workspace.id,
      async onMessage(event) {
         const data = JSON.parse(event.data) as EstimateEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create") return create(data.estimate)
         if (data.action === "update") return update(data.estimate)
         if (data.action === "delete") return deleteEstimate(data)
      },
   })
}
