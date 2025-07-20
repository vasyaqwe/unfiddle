import { useAuth } from "@/auth/hooks"
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

            update(input)

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

   return (input: Partial<OrderItem>) => {
      const queryKey = trpc.order.one.queryOptions(input).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
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
