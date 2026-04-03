import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteClient({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const deleteItem = useOptimisticDeleteClient()
   const listQueryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.client.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await queryClient.cancelQueries(listQueryOptions)

            await Promise.all([queryClient.cancelQueries(listQueryOptions)])

            const listData = queryClient.getQueryData(listQueryOptions.queryKey)

            deleteItem(input)

            return { listData }
         },
         onError: (error, _input, context) => {
            queryClient.setQueryData(
               listQueryOptions.queryKey,
               context?.listData,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSettled: (_data, _error, _input) => {
            queryClient.invalidateQueries(listQueryOptions)
         },
      }),
   )
}

export function useOptimisticDeleteClient() {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const listQueryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return (input: RouterInput["client"]["delete"]) => {
      queryClient.setQueryData(listQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((item) => item.id !== input.clientId)
      })
   }
}
