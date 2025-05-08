import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket/hooks"
import { trpc } from "@/trpc"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useUpdateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const update = useOptimisticUpdateOrder()

   return useMutation(
      trpc.order.update.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            update(input)

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
         onSuccess: (_, order) => {
            socket.order.send({
               action: "update",
               senderId: auth.user.id,
               order,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions.list)
            // queryClient.invalidateQueries(
            //    trpc.workspace.summary.queryOptions({
            //       id: auth.workspace.id,
            //    }),
            // )
         },
      }),
   )
}

export function useOptimisticUpdateOrder() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: Partial<RouterOutput["order"]["list"][number]>) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         if (input.deletedAt || input.deletedAt === null)
            return oldData.filter((item) => item.id !== input.id)

         return oldData.map((item) => {
            if (item.id === input.id) return { ...item, ...input }
            return item
         })
      })
   }
}
