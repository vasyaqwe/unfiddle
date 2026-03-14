import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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
