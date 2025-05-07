import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket/hooks"
import { trpc } from "@/trpc"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { toast } from "sonner"

export function useCreateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const search = useSearch({ strict: false })

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   const optimisticCreate = useOptimisticCreateOrder()

   return useMutation(
      trpc.order.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            optimisticCreate({
               ...input,
               id: crypto.randomUUID(),
               shortId: 0,
               sellingPrice: input.sellingPrice ?? null,
               severity: input.severity ?? "low",
               status: "pending",
               creatorId: auth.user.id,
               creator: auth.user,
               note: input.note ?? "",
               procurements: [],
               deletedAt: null,
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
   const search = useSearch({ strict: false })

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   return (input: RouterOutput["order"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData

         if (search.status?.length && !search.status.includes(input.status))
            return oldData

         if (
            search.severity?.length &&
            !search.severity.includes(input.severity)
         )
            return oldData

         return [input, ...oldData]
      })
   }
}
