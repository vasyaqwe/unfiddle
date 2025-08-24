import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { EstimateItem } from "@unfiddle/core/estimate/item/types"
import { toast } from "sonner"

export function useCreateEstimateItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const create = useOptimisticCreateEstimateItem()

   return useMutation(
      trpc.estimate.item.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.estimate.one.queryOptions({
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            create({
               estimateId: input.estimateId,
               item: {
                  id: crypto.randomUUID(),
                  name: input.name,
                  quantity: input.quantity,
                  desiredPrice: input.desiredPrice ?? null,
               },
            })

            return { data }
         },
         onError: (error, data, context) => {
            queryClient.setQueryData(
               trpc.estimate.one.queryOptions({
                  estimateId: data.estimateId,
                  workspaceId: data.workspaceId,
               }).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (item) => {
            socket.estimate.send({
               action: "create_item",
               senderId: auth.user.id,
               workspaceId: auth.workspace.id,
               estimateId: item.estimateId,
               item,
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

export function useOptimisticCreateEstimateItem() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: { estimateId: string; item: EstimateItem }) => {
      const queryKey = trpc.estimate.one.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return {
            ...oldData,
            items: [...oldData.items, input.item],
         }
      })
   }
}
