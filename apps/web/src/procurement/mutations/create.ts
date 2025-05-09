import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import type { Procurement } from "@ledgerblocks/core/procurement/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateProcurement()

   return useMutation(
      trpc.procurement.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               status: "pending",
               buyer: auth.user,
               note: input.note ?? "",
            })

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
         onSuccess: (procurement) => {
            socket.procurement.send({
               action: "create",
               senderId: auth.user.id,
               procurement: {
                  ...procurement,
                  buyer: auth.user,
               },
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

export function useOptimisticCreateProcurement() {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   return (
      input: Procurement & {
         orderId: string
      },
   ) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.orderId)
               return { ...item, procurements: [input, ...item.procurements] }
            return item
         })
      })
   }
}
