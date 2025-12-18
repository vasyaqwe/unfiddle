import { CACHE_SHORT } from "@/api"
import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useQuery } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = useOrderQueryOptions()
   const update = useOptimisticUpdateOrder()

   return useMutation(
      trpc.order.update.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.order.one.queryOptions({
               orderId: input.orderId,
               workspaceId: input.workspaceId,
            })

            await Promise.all([
               queryClient.cancelQueries(queryOptions.list),
               queryClient.cancelQueries(oneQueryOptions),
            ])

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = maybeParams.orderId
               ? queryClient.getQueryData(oneQueryOptions.queryKey)
               : null

            update(input)

            return { listData, oneData }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               queryOptions.list.queryKey,
               context?.listData,
            )
            queryClient.setQueryData(
               trpc.order.one.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }).queryKey,
               context?.oneData,
            )

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
         onSettled: (_data, _error, input) => {
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
            queryClient.invalidateQueries(
               trpc.order.one.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }),
            )

            queryClient.invalidateQueries(queryOptions.list)
            queryClient.invalidateQueries(
               trpc.order.one.queryOptions({
                  orderId: input.orderId,
                  workspaceId: input.workspaceId,
               }),
            )
            if (input.deletedAt) {
               queryClient.invalidateQueries(queryOptions.listArchived)
            }
            if (input.deletedAt === null) {
               queryClient.invalidateQueries(queryOptions.listUnarchived)
            }
         },
      }),
   )
}

export function useOptimisticUpdateOrder() {
   const auth = useAuth()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()
   const clients =
      useQuery(
         trpc.client.list.queryOptions(
            {
               workspaceId: auth.workspace.id,
            },
            {
               staleTime: CACHE_SHORT,
            },
         ),
      ).data ?? []

   return async (input: RouterInput["order"]["update"]) => {
      const oneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey

      if (input.deletedAt) {
         queryClient.invalidateQueries(queryOptions.listArchived)
      }
      if (input.deletedAt === null) {
         queryClient.invalidateQueries(queryOptions.listUnarchived)
      }

      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            ...input,
            client: clients.find((c) => c.id === input.clientId) ?? null,
         }
      })

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.orderId)
               return {
                  ...item,
                  ...input,
                  client: clients.find((c) => c.id === input.clientId) ?? null,
               }
            return item
         })
      })
   }
}
