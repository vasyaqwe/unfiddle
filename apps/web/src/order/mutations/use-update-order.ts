import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
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
   const orderId = maybeParams.orderId

   return useMutation(
      trpc.order.update.mutationOptions({
         onMutate: async (input) => {
            await Promise.all([
               queryClient.cancelQueries(queryOptions.list),
               queryClient.cancelQueries(trpc.order.one.queryOptions(input)),
            ])

            const listData = queryClient.getQueryData(
               queryOptions.list.queryKey,
            )
            const oneData = orderId
               ? queryClient.getQueryData(
                    trpc.order.one.queryOptions(input).queryKey,
                 )
               : null

            update(input)

            onMutate?.()

            return { listData, oneData }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               queryOptions.list.queryKey,
               context?.listData,
            )
            queryClient.setQueryData(
               trpc.order.one.queryOptions(input).queryKey,
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
            queryClient.invalidateQueries(trpc.order.one.queryOptions(input))
            if (input.deletedAt)
               return queryClient.invalidateQueries(queryOptions.listArchived)
            if (input.deletedAt === null)
               return queryClient.invalidateQueries(
                  queryOptions.listNotArchived,
               )

            queryClient.invalidateQueries(queryOptions.list)
         },
      }),
   )
}

export function useOptimisticUpdateOrder() {
   const auth = useAuth()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   const desc = (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

   const moveItemBetweenQueries = async <
      T extends Record<string, string | null> & {
         id: string
         createdAt: string
      },
   >(
      fromOptions: ReturnType<typeof trpc.order.list.queryOptions>,
      toOptions: ReturnType<typeof trpc.order.list.queryOptions>,
      itemId: string,
      update: Partial<T>,
   ) => {
      let fromData = queryClient.getQueryData<T[]>(fromOptions.queryKey)
      let toData = queryClient.getQueryData<T[]>(toOptions.queryKey)

      if (!fromData) {
         await queryClient.prefetchQuery(fromOptions)
         fromData = queryClient.getQueryData<T[]>(fromOptions.queryKey) || []
      }

      if (!toData) {
         await queryClient.prefetchQuery(toOptions)
         toData = queryClient.getQueryData<T[]>(toOptions.queryKey) || []
      }

      const item = fromData.find((i) => i.id === itemId)
      if (!item) return

      queryClient.setQueryData(
         fromOptions.queryKey,
         fromData.filter((i) => i.id !== itemId),
      )

      queryClient.setQueryData(toOptions.queryKey, (currentToData: T[] = []) =>
         [...currentToData, { ...item, ...update }].sort(desc),
      )
   }

   return async (input: RouterInput["order"]["update"]) => {
      const oneQueryKey = trpc.order.one.queryOptions({
         orderId: input.orderId,
         workspaceId: auth.workspace.id,
      }).queryKey

      if (input.deletedAt === null) {
         queryClient.setQueryData(oneQueryKey, (oldData) => {
            if (!oldData) return oldData
            return { ...oldData, deletedAt: null }
         })
         return await moveItemBetweenQueries(
            queryOptions.listArchived,
            queryOptions.listNotArchived,
            input.orderId,
            { deletedAt: null },
         )
      }

      if (input.deletedAt) {
         queryClient.setQueryData(oneQueryKey, (oldData) => {
            if (!oldData) return oldData
            return { ...oldData, deletedAt: new Date() }
         })
         return await moveItemBetweenQueries(
            queryOptions.listNotArchived,
            queryOptions.listArchived,
            input.orderId,
            { deletedAt: new Date().toString() },
         )
      }

      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return { ...oldData, ...input }
      })

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.orderId) return { ...item, ...input }
            return item
         })
      })
   }
}
