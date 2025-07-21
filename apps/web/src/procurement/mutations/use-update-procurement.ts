import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
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
   const orderQueryOptions = useOrderQueryOptions()

   const queryOptions = trpc.procurement.list.queryOptions({
      orderId: order.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.procurement.update.mutationOptions({
         onMutate: async (input) => {
            await Promise.all([
               queryClient.cancelQueries(orderQueryOptions.list),
               queryClient.cancelQueries(queryOptions),
            ])

            const procurements = queryClient.getQueryData(queryOptions.queryKey)
            const orders = queryClient.getQueryData(
               orderQueryOptions.list.queryKey,
            )

            update({ ...input, orderId: order.id })

            onMutate?.()

            return { procurements, orders }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(
               queryOptions.queryKey,
               context?.procurements,
            )
            queryClient.setQueryData(
               orderQueryOptions.list.queryKey,
               context?.orders,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (_data, procurement) => {
            socket.procurement.send({
               action: "update",
               senderId: auth.user.id,
               procurement,
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
            queryClient.invalidateQueries(orderQueryOptions.list)
         },
      }),
   )
}

export function useOptimisticUpdateProcurement() {
   const auth = useAuth()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return async (input: RouterInput["procurement"]["update"]) => {
      const queryKey = trpc.procurement.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((p) => {
            if (p.id === input.procurementId) return { ...p, ...input }
            return p
         })
      })
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  procurements: item.procurements.map((p) => {
                     if (p.id === input.procurementId) return { ...p, ...input }
                     return p
                  }),
               }
            return item
         })
      })
   }
}
