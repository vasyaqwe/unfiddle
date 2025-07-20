import { useAuth } from "@/auth/hooks"
import { useOrderOneQueryOptions } from "@/order/queries"
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
   const oneQueryOptions = useOrderOneQueryOptions()
   const deleteItem = useOptimisticDeleteOrderItem()

   return useMutation(
      trpc.order.item.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            deleteItem(input)

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
               action: "delete_item",
               senderId: auth.user.id,
               orderId: item.orderId,
               orderItemId: item.orderItemId,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(oneQueryOptions)
         },
      }),
   )
}

export function useOptimisticDeleteOrderItem() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: { orderId: string; orderItemId: string }) => {
      const queryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return {
            ...oldData,
            items: oldData.items.filter((i) => i.id !== input.orderItemId),
         }
      })
   }
}
