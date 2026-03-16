import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useMarkMessagesAsRead(orderId: string) {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return useMutation(
      trpc.order.message.read.markAsRead.mutationOptions({
         onMutate: async () => {
            await Promise.all([
               queryClient.cancelQueries(
                  trpc.order.message.read.orderUnreadCount.queryOptions({
                     orderId,
                     workspaceId: auth.workspace.id,
                  }),
               ),
               queryClient.cancelQueries(
                  trpc.order.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }),
               ),
               queryClient.cancelQueries(
                  trpc.order.message.read.listUnreadOrders.queryOptions({
                     workspaceId: auth.workspace.id,
                  }),
               ),
            ])

            const previousOrderUnreadCount = queryClient.getQueryData(
               trpc.order.message.read.orderUnreadCount.queryOptions({
                  orderId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )
            const previousUnreadCount = queryClient.getQueryData(
               trpc.order.message.read.unreadCount.queryOptions({
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )
            const previousUnreadOrders = queryClient.getQueryData(
               trpc.order.message.read.listUnreadOrders.queryOptions({
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )

            queryClient.setQueryData(
               trpc.order.message.read.orderUnreadCount.queryOptions({
                  orderId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
               { count: 0 },
            )

            if (previousUnreadCount && previousOrderUnreadCount) {
               queryClient.setQueryData(
                  trpc.order.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  {
                     count: Math.max(
                        0,
                        previousUnreadCount.count -
                           previousOrderUnreadCount.count,
                     ),
                  },
               )
            }

            if (previousUnreadOrders) {
               queryClient.setQueryData(
                  trpc.order.message.read.listUnreadOrders.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  {
                     orderIds: previousUnreadOrders.orderIds.filter(
                        (id) => id !== orderId,
                     ),
                  },
               )
            }

            return {
               previousOrderUnreadCount,
               previousUnreadCount,
               previousUnreadOrders,
            }
         },
         onError: (_err, _variables, context) => {
            if (context?.previousOrderUnreadCount) {
               queryClient.setQueryData(
                  trpc.order.message.read.orderUnreadCount.queryOptions({
                     orderId,
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousOrderUnreadCount,
               )
            }
            if (context?.previousUnreadCount) {
               queryClient.setQueryData(
                  trpc.order.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousUnreadCount,
               )
            }
            if (context?.previousUnreadOrders) {
               queryClient.setQueryData(
                  trpc.order.message.read.listUnreadOrders.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousUnreadOrders,
               )
            }
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.order.message.read.orderUnreadCount.queryOptions({
                  orderId,
                  workspaceId: auth.workspace.id,
               }),
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
