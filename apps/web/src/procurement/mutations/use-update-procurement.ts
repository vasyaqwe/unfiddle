import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { toast } from "sonner"

export function useUpdateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const order = useOrder()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateProcurement()

   const queryOptions = trpc.procurement.list.queryOptions({
      orderId: order.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.procurement.update.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            update({ ...input, orderId: order.id })

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
               action: "update",
               senderId: auth.user.id,
               procurement,
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

export function useOptimisticUpdateProcurement() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (input: Partial<Procurement> & { orderId: string }) => {
      const queryKey = trpc.procurement.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((p) => {
            if (p.id === input.id) return { ...p, ...input }
            return p
         })
      })
   }
}
