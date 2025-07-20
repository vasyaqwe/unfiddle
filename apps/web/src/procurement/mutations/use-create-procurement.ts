import { useAuth } from "@/auth/hooks"
import { useOrder } from "@/order/hooks"
import { useOrderOneQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Procurement } from "@unfiddle/core/procurement/types"
import { toast } from "sonner"

export function useCreateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const order = useOrder()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const oneQueryOptions = useOrderOneQueryOptions()
   const create = useOptimisticCreateProcurement()

   const queryOptions = trpc.procurement.list.queryOptions({
      orderId: order.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.procurement.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(oneQueryOptions)

            const order = queryClient.getQueryData(oneQueryOptions.queryKey)
            const data = queryClient.getQueryData(queryOptions.queryKey)
            const orderItems = order?.items ?? []
            const orderItem = orderItems.find((i) => i.id === input.orderItemId)
            if (!orderItem) return { data }

            create({
               ...input,
               id: crypto.randomUUID(),
               status: "pending",
               creator: auth.user,
               note: input.note ?? "",
               provider: input.provider ?? null,
               orderItem: {
                  name: orderItem?.name ?? "",
               },
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
         onSuccess: (procurement) => {
            socket.procurement.send({
               action: "create",
               senderId: auth.user.id,
               procurement: {
                  ...procurement,
                  creator: auth.user,
               },
               orderId: procurement.orderId,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticCreateProcurement() {
   const auth = useAuth()
   const queryClient = useQueryClient()

   return (
      input: Procurement & {
         orderId: string
      },
   ) => {
      const queryKey = trpc.procurement.list.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return [input, ...oldData]
      })
   }
}
