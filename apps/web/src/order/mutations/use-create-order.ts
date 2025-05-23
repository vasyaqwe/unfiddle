import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
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
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateOrder()

   return useMutation(
      trpc.order.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            create({
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
               assignees: [],
               deletedAt: null,
               createdAt: new Date().toString(),
            })

            onMutate?.()

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(queryOptions.list.queryKey, context?.data)
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
                  assignees: [],
               },
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.orders.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticCreateOrder() {
   const queryClient = useQueryClient()
   const search = useSearch({ strict: false })
   const queryOptions = useOrderQueryOptions()

   return (input: RouterOutput["order"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
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
