import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useQuery } from "@tanstack/react-query"

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

export function useUnreadCount(): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.estimate.message.read.unreadCount.queryOptions({
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
