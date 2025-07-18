import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { toast } from "sonner"

export function useUpdateOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const update = useOptimisticUpdateOrderItem()

   return useMutation(
      trpc.order.item.update.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            update(input)

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
         onSuccess: (_, item) => {
            socket.order.send({
               action: "update_item",
               senderId: auth.user.id,
               item,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticUpdateOrderItem() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: Partial<OrderItem>) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => ({
            ...item,
            items: item.items.map((item) => {
               if (item.id === input.id) return { ...item, ...input }
               return item
            }),
         }))
      })
   }
}
