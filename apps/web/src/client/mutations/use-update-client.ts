import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateClient({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   // const maybeParams = useParams({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const update = useOptimisticUpdateClient()
   const listQueryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.client.update.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            // const oneQueryOptions = trpc.client.one.queryOptions({
            //    clientId: input.clientId,
            //    workspaceId: input.workspaceId,
            // })

            await Promise.all([
               queryClient.cancelQueries(listQueryOptions),
               // queryClient.cancelQueries(oneQueryOptions),
            ])

            const listData = queryClient.getQueryData(listQueryOptions.queryKey)
            // const oneData = maybeParams.clientId
            //    ? queryClient.getQueryData(oneQueryOptions.queryKey)
            //    : null

            update(input)

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

export function useOptimisticUpdateClient() {
   const auth = useAuth()
   const queryClient = useQueryClient()
   const listQueryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return async (input: RouterInput["client"]["update"]) => {
      // const oneQueryKey = trpc.client.one.queryOptions({
      //    clientId: input.clientId,
      //    workspaceId: auth.workspace.id,
      // }).queryKey

      // queryClient.setQueryData(oneQueryKey, (oldData) => {
      //    if (!oldData) return oldData
      //    return { ...oldData, ...input }
      // })
      queryClient.setQueryData(listQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.clientId) return { ...item, ...input }
            return item
         })
      })
   }
}
