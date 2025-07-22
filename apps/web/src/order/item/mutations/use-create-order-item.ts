import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderItem } from "@unfiddle/core/order/item/types"
import { toast } from "sonner"

export function useCreateOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const create = useOptimisticCreateOrderItem()

   return useMutation(
      trpc.order.item.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(trpc.order.one.queryOptions(input))

            const data = queryClient.getQueryData(
               trpc.order.one.queryOptions(input).queryKey,
            )

            create({
               orderId: input.orderId,
               item: {
                  id: crypto.randomUUID(),
                  name: input.name,
                  quantity: input.quantity,
                  desiredPrice: input.desiredPrice ?? null,
               },
            })

            onMutate?.()

            return { data }
         },
         onError: (error, data, context) => {
            queryClient.setQueryData(
               trpc.order.one.queryOptions(data).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (item) => {
            socket.order.send({
               action: "create_item",
               senderId: auth.user.id,
               workspaceId: auth.workspace.id,
               orderId: item.orderId,
               item,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(trpc.order.one.queryOptions(input))
         },
      }),
   )
}

export function useOptimisticCreateOrderItem() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: { orderId: string; item: OrderItem }) => {
      const queryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return {
            ...oldData,
            items: [...oldData.items, input.item],
         }
      })
   }
}
