import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateEstimateItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const estimate = useEstimate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateEstimateItem()

   return useMutation(
      trpc.estimate.item.update.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.estimate.one.queryOptions({
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            update({ ...input, estimateId: estimate.id })

            return { data }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               trpc.estimate.one.queryOptions({
                  estimateId: input.estimateId,
                  workspaceId: input.workspaceId,
               }).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSuccess: (_data, item) => {
            socket.estimate.send({
               action: "update_item",
               senderId: auth.user.id,
               item,
               estimateId: estimate.id,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(
               trpc.estimate.one.queryOptions({
                  estimateId: input.estimateId,
                  workspaceId: input.workspaceId,
               }),
            )
         },
      }),
   )
}

export function useOptimisticUpdateEstimateItem() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: RouterInput["estimate"]["item"]["update"]) => {
      const estimateOneQueryKey = trpc.estimate.one.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey

      queryClient.setQueryData(estimateOneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            items: oldData.items.map((item) => {
               if (item.id === input.estimateItemId)
                  return { ...item, ...input }
               return item
            }),
         }
      })
   }
}
