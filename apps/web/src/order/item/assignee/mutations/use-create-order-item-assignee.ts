import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import type { OrderItemAssignee } from "@unfiddle/core/order/item/assignee/types"
import { toast } from "sonner"

export function useCreateOrderItemAssignee({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateOrderItemAssignee()
   const orderId = maybeParams.orderId

   return useMutation(
      trpc.order.item.assignee.create.mutationOptions({
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
            const oneData = orderId
               ? queryClient.getQueryData(oneQueryOptions.queryKey)
               : null

            create({
               orderItemId: input.orderItemId,
               orderId: input.orderId,
               assignee: { user: auth.user },
            })

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
               action: "create_item_assignee",
               senderId: auth.user.id,
               orderId: data.orderId,
               orderItemId: data.orderItemId,
               workspaceId: auth.workspace.id,
               assignee: { user: auth.user },
            })
         },
         onSettled: (_data, _error, input) => {
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

export function useOptimisticCreateOrderItemAssignee() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: {
      orderItemId: string
      orderId: string
      assignee: OrderItemAssignee
   }) => {
      const oneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            items: oldData.items.map((item) => {
               if (item.id === input.orderItemId)
                  return {
                     ...item,
                     assignees: item.assignees.some(
                        (a) => a.user.id === input.assignee.user.id,
                     )
                        ? item.assignees
                        : [input.assignee, ...item.assignees],
                  }
               return item
            }),
         }
      })
   }
}
