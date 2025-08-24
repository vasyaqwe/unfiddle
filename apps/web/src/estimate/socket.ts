import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateEstimateItem } from "@/estimate/item/mutations/use-create-estimate-item"
import { useOptimisticDeleteEstimateItem } from "@/estimate/item/mutations/use-delete-estimate-item"
import { useOptimisticUpdateEstimateItem } from "@/estimate/item/mutations/use-update-estimate-item"
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
   const createItem = useOptimisticCreateEstimateItem()
   const updateItem = useOptimisticUpdateEstimateItem()
   const deleteItem = useOptimisticDeleteEstimateItem()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "estimate",
      room: auth.workspace.id,
      async onMessage(event) {
         const data = JSON.parse(event.data) as EstimateEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create_item") return createItem(data)
         if (data.action === "update_item") return updateItem(data.item)
         if (data.action === "delete_item") return deleteItem(data)

         if (data.action === "create") return create(data.estimate)
         if (data.action === "update") return update(data.estimate)
         if (data.action === "delete") return deleteEstimate(data)
      },
   })
}
