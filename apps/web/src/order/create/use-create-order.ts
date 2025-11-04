import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useCreateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const create = useOptimisticCreateOrder()
   const attachments = useAttachments({ subjectId: auth.workspace.id })

   return useMutation(
      trpc.order.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await queryClient.cancelQueries(queryOptions.list)

            const data = queryClient.getQueryData(queryOptions.list.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               shortId: 0,
               currency: input.currency ?? "UAH",
               severity: input.severity ?? "low",
               creator: auth.user,
               status: "pending",
               paymentType: input.paymentType ?? "cash",
               assignees: [],
               procurements: [],
               deletedAt: null,
               createdAt: new Date(),
               sellingPrice: input.sellingPrice ?? 0,
            })

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(queryOptions.list.queryKey, context?.data)
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (order) => {
            socket.order.send({
               action: "create",
               senderId: auth.user.id,
               order: {
                  ...order,
                  currency: order.currency ?? "UAH",
                  severity: order.severity ?? "low",
                  status: "pending",
                  paymentType: order.paymentType ?? "cash",
                  deletedAt: null,
                  createdAt: new Date(),
                  sellingPrice: order.sellingPrice ?? 0,
                  creator: auth.user,
                  assignees: [],
                  procurements: [],
               },
            })
            attachments.clear()
            // notify({
            //    title: `➕ ${auth.user.name} додав замовлення`,
            //    body: order.name,
            //    priority: order.severity === "high" ? "max" : "default",
            // })
         },
         onSettled: () => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.orders.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticCreateOrder() {
   const queryClient = useQueryClient()
   const search = useSearch({ strict: false })
   const queryOptions = useOrderQueryOptions()

   return (input: RouterOutput["order"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         if (search.status?.length) return oldData

         if (
            search.severity?.length &&
            !search.severity.includes(input.severity)
         )
            return oldData

         return [input, ...oldData]
      })
   }
}
