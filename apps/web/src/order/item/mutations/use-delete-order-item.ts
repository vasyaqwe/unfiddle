import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDeleteOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const deleteItem = useOptimisticDeleteOrderItem()

   return useMutation(
      trpc.order.item.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            deleteItem(input)

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
               action: "delete_item",
               senderId: auth.user.id,
               orderId: item.orderId,
               orderItemId: item.orderItemId,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticDeleteOrderItem() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: { orderId: string; orderItemId: string }) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  items: item.items.filter((i) => i.id !== input.orderItemId),
               }
            return item
         })
      })
   }
}
