import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderAssignee } from "@unfiddle/core/order/types"
import { toast } from "sonner"

export function useCreateOrderAssignee({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateOrderAssignee()

   return useMutation(
      trpc.order.assignee.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            create({ ...input, assignee: { user: auth.user } })

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
         onSuccess: (_, assignee) => {
            socket.order.send({
               action: "create_assignee",
               senderId: auth.user.id,
               orderId: assignee.orderId,
               assignee: { user: auth.user },
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticCreateOrderAssignee() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: { orderId: string; assignee: OrderAssignee }) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  assignees: [input.assignee, ...item.assignees],
               }
            return item
         })
      })
   }
}
