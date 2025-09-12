import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteEstimateItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteItem = useOptimisticDeleteEstimateItem()

   return useMutation(
      trpc.estimate.item.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.estimate.one.queryOptions({
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            deleteItem(input)

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
         onSuccess: (_, data) => {
            socket.estimate.send({
               action: "delete_item",
               senderId: auth.user.id,
               estimateId: data.estimateId,
               estimateItemId: data.estimateItemId,
               workspaceId: auth.workspace.id,
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

export function useOptimisticDeleteEstimateItem() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: RouterInput["estimate"]["item"]["delete"]) => {
      const queryKey = trpc.estimate.one.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return {
            ...oldData,
            items: oldData.items.filter((i) => i.id !== input.estimateItemId),
         }
      })
   }
}
