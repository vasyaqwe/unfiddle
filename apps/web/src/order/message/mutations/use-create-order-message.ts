import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OrderMessage } from "@unfiddle/core/order/message/types"
import { toast } from "sonner"

export function useCreateOrderMessage({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const create = useOptimisticCreateOrderMessage()

   return useMutation(
      trpc.order.message.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const listQueryOptions = trpc.order.message.list.queryOptions({
               orderId: input.orderId,
               workspaceId: input.workspaceId,
            })

            await queryClient.cancelQueries(listQueryOptions)

            const data = queryClient.getQueryData(listQueryOptions.queryKey)

            create({
               orderId: input.orderId,
               message: {
                  id: crypto.randomUUID(),
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
                  creatorId: auth.user.id,
                  content: input.content,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  creator: {
                     id: auth.user.id,
                     name: auth.user.name,
                     image: auth.user.image,
                  },
               },
            })

            return { data }
         },
         onError: (error, data, context) => {
            queryClient.setQueryData(
               trpc.order.message.list.queryOptions({
                  orderId: data.orderId,
                  workspaceId: data.workspaceId,
               }).queryKey,
               context?.data,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (message) => {
            socket.order.send({
               action: "create_message",
               senderId: auth.user.id,
               workspaceId: auth.workspace.id,
               orderId: message.orderId,
               message,
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

export function useOptimisticCreateOrderMessage() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   return (input: { orderId: string; message: OrderMessage }) => {
      const queryKey = trpc.order.message.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData

         return [input.message, ...oldData]
      })
   }
}
