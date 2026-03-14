import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useMarkMessagesAsRead(orderId: string) {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return useMutation(
      trpc.order.message.read.markAsRead.mutationOptions({
         onSuccess: () => {
            queryClient.setQueryData(
               trpc.order.message.read.orderUnreadCount.queryOptions({
                  orderId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
               { count: 0 },
            )

            queryClient.invalidateQueries(
               trpc.order.message.read.unreadCount.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )

            queryClient.invalidateQueries(
               trpc.order.message.read.listUnreadOrders.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )
         },
      }),
   )
}

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
