import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket/hooks"
import { trpc } from "@/trpc"
import type { RouterInput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDeleteOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   const queryData = useDeleteOrderQueryData()

   return useMutation(
      trpc.order.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            queryData.mutate({
               input,
            })

            onMutate?.()

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.data)
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (_, order) => {
            socket.order.send({
               action: "delete",
               senderId: auth.user.id,
               orderId: order.id,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useDeleteOrderQueryData() {
   const queryClient = useQueryClient()
   const auth = useAuth()

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return {
      mutate: ({
         input,
      }: {
         input: RouterInput["order"]["delete"]
      }) => {
         queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
            if (!oldData) return oldData
            return oldData.filter((item) => item.id !== input.id)
         })
      },
   }
}
