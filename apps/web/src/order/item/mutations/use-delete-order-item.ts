import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteItem = useOptimisticDeleteOrderItem()

   return useMutation(
      trpc.order.item.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(trpc.order.one.queryOptions(input))

            const data = queryClient.getQueryData(
               trpc.order.one.queryOptions(input).queryKey,
            )

            deleteItem(input)

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
         onSuccess: (_, item) => {
            socket.order.send({
               action: "delete_item",
               senderId: auth.user.id,
               orderId: item.orderId,
               orderItemId: item.orderItemId,
               workspaceId: auth.workspace.id,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(trpc.order.one.queryOptions(input))
         },
      }),
   )
}

export function useOptimisticDeleteOrderItem() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: RouterInput["order"]["item"]["delete"]) => {
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
