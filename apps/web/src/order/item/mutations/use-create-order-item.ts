import { useAuth } from "@/auth/hooks"
import { useOrderOneQueryOptions } from "@/order/queries"
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
   const oneQueryOptions = useOrderOneQueryOptions()
   const create = useOptimisticCreateOrderItem()

   return useMutation(
      trpc.order.item.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(oneQueryOptions)

            const data = queryClient.getQueryData(oneQueryOptions.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               desiredPrice: input.desiredPrice ?? null,
            })

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
         onSuccess: (item) => {
            socket.order.send({
               action: "create_item",
               senderId: auth.user.id,
               orderId: item.orderId,
               item,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(oneQueryOptions)
         },
      }),
   )
}

export function useOptimisticCreateOrderItem() {
   const queryClient = useQueryClient()

   return (input: OrderItem & { orderId: string }) => {
      const queryKey = trpc.order.one.queryOptions(input).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return {
            ...oldData,
            items: [...oldData.items, input],
         }
      })
   }
}
