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

   return useMutation(
      trpc.order.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.order.one.queryOptions({
               orderId: input.orderId,
               workspaceId: input.workspaceId,
            })

            await Promise.all([
               queryClient.cancelQueries(queryOptions.list),
               queryClient.cancelQueries(oneQueryOptions),
            ])

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = maybeParams.orderId
               ? queryClient.getQueryData(oneQueryOptions.queryKey)
               : null

            deleteItem(input)

            return { listData, oneData }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               queryOptions.list.queryKey,
               context?.listData,
            )
            queryClient.setQueryData(
               trpc.order.one.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }).queryKey,
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
            queryClient.invalidateQueries(
               trpc.order.one.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }),
            )
         },
      }),
   )
}

export function useOptimisticDeleteOrder() {
   const params = useParams({ strict: false })
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: RouterInput["order"]["delete"]) => {
      const oneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: input.workspaceId,
      }).queryKey

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
