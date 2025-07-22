import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const order = useOrder()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateOrderItem()

   return useMutation(
      trpc.order.item.update.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(trpc.order.one.queryOptions(input))

            const data = queryClient.getQueryData(
               trpc.order.one.queryOptions(input).queryKey,
            )

            update({ ...input, orderId: order.id })

            onMutate?.()

            return { data }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               trpc.order.one.queryOptions(input).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSuccess: (_data, item) => {
            socket.order.send({
               action: "update_item",
               senderId: auth.user.id,
               item,
               orderId: order.id,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(trpc.order.one.queryOptions(input))
         },
      }),
   )
}

export function useOptimisticUpdateOrderItem() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: RouterInput["order"]["item"]["update"]) => {
      const orderOneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey

      queryClient.setQueryData(orderOneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            items: oldData.items.map((item) => {
               if (item.id === input.orderItemId) return { ...item, ...input }
               return item
            }),
         }
      })
   }
}
