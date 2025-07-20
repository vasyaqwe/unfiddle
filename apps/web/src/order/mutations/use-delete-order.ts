import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
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
   const workspaceId = auth.workspace.id

   return useMutation(
      trpc.order.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)
            if (orderId) {
               await queryClient.cancelQueries(
                  trpc.order.one.queryOptions({ orderId, workspaceId }),
               )
            }

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = orderId
               ? queryClient.getQueryData(
                    trpc.order.one.queryOptions({ orderId, workspaceId })
                       .queryKey,
                 )
               : null

            deleteItem(input)

            onMutate?.()

            return { listData, oneData }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(
               queryOptions.list.queryKey,
               context?.listData,
            )
            if (orderId) {
               queryClient.setQueryData(
                  trpc.order.one.queryOptions({ orderId, workspaceId })
                     .queryKey,
                  context?.oneData,
               )
            }
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
            })
         },
         onSettled: () => {
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
            if (orderId) {
               queryClient.invalidateQueries(
                  trpc.order.one.queryOptions({ orderId, workspaceId }),
               )
            }
         },
      }),
   )
}

export function useOptimisticDeleteOrder() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: RouterInput["order"]["delete"]) => {
      const oneQueryKey = trpc.order.one.queryOptions(input).queryKey

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((item) => item.id !== input.orderId)
      })
      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return null
      })
   }
}
