import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket/hooks"
import { trpc } from "@/trpc"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   const optimisticCreate = useOptimisticCreateOrder()

   return useMutation(
      trpc.order.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            const highestShortId = data?.length
               ? Math.max(...data.map((o) => o.shortId))
               : 0

            optimisticCreate({
               ...input,
               id: crypto.randomUUID(),
               shortId: highestShortId + 1,
               status: "pending",
               creatorId: auth.user.id,
               creator: auth.user,
               note: input.note ?? "",
               procurements: [],
            })

            onMutate?.()

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.data)
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (order) => {
            socket.order.send({
               action: "create",
               senderId: auth.user.id,
               order: {
                  ...order,
                  creator: auth.user,
                  procurements: [],
               },
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticCreateOrder() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return (input: RouterOutput["order"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return [input, ...oldData]
      })
   }
}
