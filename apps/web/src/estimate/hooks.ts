import { trpc } from "@/trpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import invariant from "@unfiddle/core/invariant"

export function useEstimate() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId",
   })
   const query = useSuspenseQuery(trpc.estimate.one.queryOptions(params))
   const estimate = query.data
   invariant(estimate, "Estimate not found")

   return estimate
}
