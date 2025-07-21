import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useOrderOneQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { toast } from "sonner"

export function useUpdateOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const order = useOrder()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const oneQueryOptions = useOrderOneQueryOptions()
   const update = useOptimisticUpdateOrderItem()

   return useMutation(
      trpc.order.item.update.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            update({ ...input, orderId: order.id })

            onMutate?.()

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(oneQueryOptions.queryKey, context?.data)
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (_, item) => {
            socket.order.send({
               action: "update_item",
               senderId: auth.user.id,
               item,
               orderId: order.id,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(oneQueryOptions)
         },
      }),
   )
}

export function useOptimisticUpdateOrderItem() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: Partial<OrderItem> & { orderId: string }) => {
      const orderOneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey

      queryClient.setQueryData(orderOneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            items: oldData.items.map((item) => {
               if (item.id === input.id) return { ...item, ...input }
               return item
            }),
         }
      })
   }
}
