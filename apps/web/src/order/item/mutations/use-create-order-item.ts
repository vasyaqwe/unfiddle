import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderItem } from "@unfiddle/core/order/types"
import { toast } from "sonner"

export function useCreateOrderItem({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateOrderItem()

   return useMutation(
      trpc.order.item.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               desiredPrice: input.desiredPrice ?? null,
            })

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
         onSuccess: (item) => {
            socket.order.send({
               action: "create_item",
               senderId: auth.user.id,
               orderId: item.orderId,
               item,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticCreateOrderItem() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: OrderItem & { orderId: string }) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  items: [...item.items, input],
               }
            return item
         })
      })
   }
}
