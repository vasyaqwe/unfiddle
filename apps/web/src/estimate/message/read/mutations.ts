import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useMarkMessagesAsRead(estimateId: string) {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return useMutation(
      trpc.estimate.message.read.markAsRead.mutationOptions({
         onMutate: async () => {
            await Promise.all([
               queryClient.cancelQueries(
                  trpc.estimate.message.read.estimateUnreadCount.queryOptions({
                     estimateId,
                     workspaceId: auth.workspace.id,
                  }),
               ),
               queryClient.cancelQueries(
                  trpc.estimate.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }),
               ),
               queryClient.cancelQueries(
                  trpc.estimate.message.read.listUnreadEstimates.queryOptions({
                     workspaceId: auth.workspace.id,
                  }),
               ),
            ])

            const previousEstimateUnreadCount = queryClient.getQueryData(
               trpc.estimate.message.read.estimateUnreadCount.queryOptions({
                  estimateId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )
            const previousUnreadCount = queryClient.getQueryData(
               trpc.estimate.message.read.unreadCount.queryOptions({
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )
            const previousUnreadEstimates = queryClient.getQueryData(
               trpc.estimate.message.read.listUnreadEstimates.queryOptions({
                  workspaceId: auth.workspace.id,
               }).queryKey,
            )

            queryClient.setQueryData(
               trpc.estimate.message.read.estimateUnreadCount.queryOptions({
                  estimateId,
                  workspaceId: auth.workspace.id,
               }).queryKey,
               { count: 0 },
            )

            if (previousUnreadCount && previousEstimateUnreadCount) {
               queryClient.setQueryData(
                  trpc.estimate.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  {
                     count: Math.max(
                        0,
                        previousUnreadCount.count -
                           previousEstimateUnreadCount.count,
                     ),
                  },
               )
            }

            if (previousUnreadEstimates) {
               queryClient.setQueryData(
                  trpc.estimate.message.read.listUnreadEstimates.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  {
                     estimateIds: previousUnreadEstimates.estimateIds.filter(
                        (id) => id !== estimateId,
                     ),
                  },
               )
            }

            return {
               previousEstimateUnreadCount,
               previousUnreadCount,
               previousUnreadEstimates,
            }
         },
         onError: (_err, _variables, context) => {
            if (context?.previousEstimateUnreadCount) {
               queryClient.setQueryData(
                  trpc.estimate.message.read.estimateUnreadCount.queryOptions({
                     estimateId,
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousEstimateUnreadCount,
               )
            }
            if (context?.previousUnreadCount) {
               queryClient.setQueryData(
                  trpc.estimate.message.read.unreadCount.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousUnreadCount,
               )
            }
            if (context?.previousUnreadEstimates) {
               queryClient.setQueryData(
                  trpc.estimate.message.read.listUnreadEstimates.queryOptions({
                     workspaceId: auth.workspace.id,
                  }).queryKey,
                  context.previousUnreadEstimates,
               )
            }
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.estimate.message.read.estimateUnreadCount.queryOptions({
                  estimateId,
                  workspaceId: auth.workspace.id,
               }),
            )

            queryClient.invalidateQueries(
               trpc.estimate.message.read.unreadCount.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )

            queryClient.invalidateQueries(
               trpc.estimate.message.read.listUnreadEstimates.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )
         },
      }),
   )
}
