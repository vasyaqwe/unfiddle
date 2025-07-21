import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const deleteItem = useOptimisticDeleteOrder()
   const orderId = maybeParams.orderId

   return useMutation(
      trpc.order.delete.mutationOptions({
         onMutate: async (input) => {
            await Promise.all([
               queryClient.cancelQueries(queryOptions.list),
               queryClient.cancelQueries(trpc.order.one.queryOptions(input)),
            ])

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = orderId
               ? queryClient.getQueryData(
                    trpc.order.one.queryOptions(input).queryKey,
                 )
               : null

            deleteItem(input)

            onMutate?.()

            return { listData, oneData }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               queryOptions.list.queryKey,
               context?.listData,
            )
            queryClient.setQueryData(
               trpc.order.one.queryOptions(input).queryKey,
               context?.oneData,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSuccess: (_, data) => {
            socket.order.send({
               action: "delete",
               senderId: auth.user.id,
               orderId: data.orderId,
               workspaceId: auth.workspace.id,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.profit.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.orders.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions.list)
            queryClient.invalidateQueries(trpc.order.one.queryOptions(input))
         },
      }),
   )
}

export function useOptimisticDeleteOrder() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()
   const navigate = useNavigate()
   const params = useParams({ strict: false })

   return (input: RouterInput["order"]["delete"]) => {
      const oneQueryKey = trpc.order.one.queryOptions(input).queryKey

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((item) => item.id !== input.orderId)
      })
      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         if (params.orderId) {
            navigate({
               to: "/$workspaceId",
               params: { workspaceId: input.workspaceId },
            })
         }
         return null
      })
   }
}
