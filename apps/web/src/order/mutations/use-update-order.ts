import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const search = useSearch({ strict: false })
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
         onSettled: (_, _2, input) => {
            queryClient.invalidateQueries(
               trpc.workspace.analytics.stats.queryOptions({
                  id: auth.workspace.id,
                  currency: search.currency ?? "UAH",
               }),
            )
            queryClient.invalidateQueries(
               trpc.workspace.analytics.profit.queryOptions({
                  id: auth.workspace.id,
                  currency: search.currency ?? "UAH",
               }),
            )
            queryClient.invalidateQueries(queryOptions.list)
            if (input.deletedAt)
               return queryClient.invalidateQueries(queryOptions.listArchived)
            if (input.deletedAt === null)
               return queryClient.invalidateQueries(
                  queryOptions.listNotArchived,
               )
         },
      }),
   )
}

export function useOptimisticUpdateOrder() {
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
      fromKey: unknown[],
      toKey: unknown[],
      itemId: string,
      update: Partial<T>,
   ) => {
      let fromData = queryClient.getQueryData<T[]>(fromKey)
      let toData = queryClient.getQueryData<T[]>(toKey)

      if (!fromData) {
         await queryClient.prefetchQuery({ queryKey: fromKey })
         fromData = queryClient.getQueryData<T[]>(fromKey) || []
      }

      if (!toData) {
         await queryClient.prefetchQuery({ queryKey: toKey })
         toData = queryClient.getQueryData<T[]>(toKey) || []
      }

      const item = fromData.find((i) => i.id === itemId)
      if (!item) return

      queryClient.setQueryData(
         fromKey,
         fromData.filter((i) => i.id !== itemId),
      )

      queryClient.setQueryData(toKey, (currentToData: T[] = []) =>
         [...currentToData, { ...item, ...update }].sort(desc),
      )
   }

   return async (input: Partial<RouterOutput["order"]["list"][number]>) => {
      if (input.deletedAt === null) {
         return await moveItemBetweenQueries(
            queryOptions.listArchived.queryKey,
            queryOptions.listNotArchived.queryKey,
            input.id ?? "",
            { deletedAt: null },
         )
      }

      if (input.deletedAt) {
         return await moveItemBetweenQueries(
            queryOptions.listNotArchived.queryKey,
            queryOptions.listArchived.queryKey,
            input.id ?? "",
            { deletedAt: new Date().toString() },
         )
      }

      queryClient.setQueryData(queryOptions.list.queryKey, (oldData) => {
         if (!oldData) return oldData

         return oldData.map((item) => {
            if (item.id === input.id) return { ...item, ...input }
            return item
         })
      })
   }
}
