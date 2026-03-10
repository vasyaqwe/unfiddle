import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Mark messages as read for an order.
 * Call this when the order detail page mounts.
 * Fire and forget - no loading states needed.
 */
export function useMarkMessagesAsRead(orderId: string) {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return useMutation(
      trpc.order.message.read.markAsRead.mutationOptions({
         onSuccess: () => {
            // Immediately update the unread count to 0 in the cache
            queryClient.setQueryData(
               trpc.order.message.read.getUnreadCount.queryOptions({
                  orderId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
               { count: 0 },
            )

            // Invalidate global unread count
            queryClient.invalidateQueries(
               trpc.order.message.read.getGlobalUnreadCount.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )

            // Invalidate unread orders list
            queryClient.invalidateQueries(
               trpc.order.message.read.getUnreadOrders.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )
         },
      }),
   )
}

/**
 * Get the unread message count for a specific order.
 * Returns 0 if there are no unread messages.
 */
export function useUnreadCount(orderId: string): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.getUnreadCount.queryOptions({
         orderId,
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.count ?? 0
}

/**
 * Get the total unread message count across all orders in the workspace.
 * Use this for the global unread indicator.
 */
export function useGlobalUnreadCount(): number {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.getGlobalUnreadCount.queryOptions({
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.count ?? 0
}

/**
 * Get a list of order IDs that have unread messages.
 * Use this if you need to filter or highlight orders with unreads.
 */
export function useUnreadOrders(): string[] {
   const auth = useAuth()

   const { data } = useQuery(
      trpc.order.message.read.getUnreadOrders.queryOptions({
         workspaceId: auth.workspace.id,
      }),
   )

   return data?.orderIds ?? []
}
