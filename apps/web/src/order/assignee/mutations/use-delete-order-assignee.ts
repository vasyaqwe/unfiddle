import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { toast } from "sonner"

export function useDeleteOrderAssignee({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const deleteItem = useOptimisticDeleteOrderAssignee()
   const orderId = maybeParams.orderId

   return useMutation(
      trpc.order.assignee.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)
            if (orderId) {
               await queryClient.cancelQueries(
                  trpc.order.one.queryOptions({ orderId }),
               )
            }

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = orderId
               ? queryClient.getQueryData(
                    trpc.order.one.queryOptions({ orderId }).queryKey,
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
                  trpc.order.one.queryOptions({ orderId }).queryKey,
                  context?.oneData,
               )
            }
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSuccess: (_, assignee) => {
            socket.order.send({
               action: "delete_assignee",
               senderId: auth.user.id,
               orderId: assignee.orderId,
               userId: assignee.userId,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
            if (orderId) {
               queryClient.invalidateQueries(
                  trpc.order.one.queryOptions({ orderId }),
               )
            }
         },
      }),
   )
}

export function useOptimisticDeleteOrderAssignee() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: { orderId: string; userId: string }) => {
      const oneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
      }).queryKey
      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            assignees: oldData.assignees.filter(
               (a) => a.user.id !== input.userId,
            ),
         }
      })

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  assignees: item.assignees.filter(
                     (a) => a.user.id !== input.userId,
                  ),
               }
            return item
         })
      })
   }
}
