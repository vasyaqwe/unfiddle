import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const order = useOrder()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteItem = useOptimisticDeleteProcurement()

   const queryOptions = trpc.procurement.list.queryOptions({
      orderId: order.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.procurement.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            deleteItem({ ...input, orderId: order.id })

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
         onSuccess: (_, procurement) => {
            socket.procurement.send({
               action: "delete",
               senderId: auth.user.id,
               procurementId: procurement.id,
               orderId: order.id,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.profit.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticDeleteProcurement() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (
      input: RouterInput["procurement"]["delete"] & { orderId: string },
   ) => {
      const queryKey = trpc.procurement.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((p) => p.id !== input.id)
      })
   }
}
