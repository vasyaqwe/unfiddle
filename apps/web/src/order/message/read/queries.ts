import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useQuery } from "@tanstack/react-query"

export function useOrderUnreadCount(orderId: string): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.orderUnreadCount.queryOptions({
         orderId,
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.count ?? 0
}

export function useUnreadCount(): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.unreadCount.queryOptions({
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.count ?? 0
}

export function useUnreadOrders(): string[] {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.listUnreadOrders.queryOptions({
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.orderIds ?? []
}
