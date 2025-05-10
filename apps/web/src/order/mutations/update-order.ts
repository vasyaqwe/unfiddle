import { useAuth } from "@/auth/hooks"
import { useOrderQueryOptions } from "@/order/queries"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useUpdateOrder({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
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
               trpc.workspace.summary.queryOptions({
                  id: auth.workspace.id,
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

export function useOptimisticUpdateOrder({
   invalidate = false,
}: { invalidate?: boolean } = {}) {
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()

   const desc = (a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

   const moveItemBetweenQueries = <
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
      const fromData = queryClient.getQueryData<T[]>(fromKey) || []
      const item = fromData.find((i) => i.id === itemId)
      if (!item) return

      queryClient.setQueryData(
         fromKey,
         fromData.filter((i) => i.id !== itemId),
      )

      queryClient.setQueryData(toKey, (toData: T[] = []) =>
         [...toData, { ...item, ...update }].sort(desc),
      )
   }

   return (input: Partial<RouterOutput["order"]["list"][number]>) => {
      if (input.deletedAt === null) {
         moveItemBetweenQueries(
            queryOptions.listArchived.queryKey,
            queryOptions.listNotArchived.queryKey,
            input.id ?? "",
            { deletedAt: null },
         )
         if (invalidate)
            queryClient.invalidateQueries(queryOptions.listNotArchived)
         return
      }

      if (input.deletedAt) {
         moveItemBetweenQueries(
            queryOptions.listNotArchived.queryKey,
            queryOptions.listArchived.queryKey,
            input.id ?? "",
            { deletedAt: new Date().toString() },
         )
         if (invalidate)
            queryClient.invalidateQueries(queryOptions.listArchived)
         return
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
