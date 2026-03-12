import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteOrderMessage({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteMessage = useOptimisticDeleteOrderMessage()

   return useMutation(
      trpc.order.message.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const listQueryOptions = trpc.order.message.list.queryOptions({
               orderId: input.orderId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(listQueryOptions)

            const data = queryClient.getQueryData(listQueryOptions.queryKey)

            deleteMessage(input)

            return { data }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               trpc.order.message.list.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (_, data) => {
            socket.order.send({
               action: "delete_message",
               senderId: auth.user.id,
               orderId: data.orderId,
               orderMessageId: data.orderMessageId,
               workspaceId: auth.workspace.id,
            })
         },
         onSettled: (_data, _error, input) => {
            queryClient.invalidateQueries(
               trpc.order.message.list.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }),
            )
         },
      }),
   )
}

export function useOptimisticDeleteOrderMessage() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: RouterInput["order"]["message"]["delete"]) => {
      const queryKey = trpc.order.message.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.filter((m) => m.id !== input.orderMessageId)
      })
   }
}
