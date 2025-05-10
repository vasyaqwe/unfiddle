import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import type { Procurement } from "@ledgerblocks/core/procurement/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useUpdateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const update = useOptimisticUpdateProcurement()

   return useMutation(
      trpc.procurement.update.mutationOptions({
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
         onSuccess: (_, procurement) => {
            socket.procurement.send({
               action: "update",
               senderId: auth.user.id,
               procurement,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.workspace.summary.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticUpdateProcurement() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (input: Partial<Procurement>) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => ({
            ...item,
            procurements: item.procurements.map((p) => {
               if (p.id === input.id) return { ...p, ...input }
               return p
            }),
         }))
      })
   }
}
