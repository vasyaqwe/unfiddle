import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateOrderMessage({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateOrderMessage()

   return useMutation(
      trpc.order.message.update.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const listQueryOptions = trpc.order.message.list.queryOptions({
               orderId: input.orderId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(listQueryOptions)

            const data = queryClient.getQueryData(listQueryOptions.queryKey)

            update(input)

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
         onSuccess: (_data, message) => {
            socket.order.send({
               action: "update_message",
               senderId: auth.user.id,
               message,
               orderId: message.orderId,
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

export function useOptimisticUpdateOrderMessage() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: RouterInput["order"]["message"]["update"]) => {
      const listQueryKey = trpc.order.message.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey

      queryClient.setQueryData(listQueryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((message) => {
            if (message.id === input.orderMessageId)
               return {
                  ...message,
                  content: input.content,
                  updatedAt: new Date(),
               }
            return message
         })
      })
   }
}
