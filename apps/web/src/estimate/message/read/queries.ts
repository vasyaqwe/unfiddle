import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"

export function useEstimateUnreadCount(estimateId: string): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.estimate.message.read.estimateUnreadCount.queryOptions({
         estimateId,
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.count ?? 0
}

export function useUnreadEstimates(): string[] {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.estimate.message.read.listUnreadEstimates.queryOptions({
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.estimateIds ?? []
}
