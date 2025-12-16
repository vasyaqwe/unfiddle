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

            // const oneQueryOptions = trpc.client.one.queryOptions({
            //    clientId: input.clientId,
            //    workspaceId: input.workspaceId,
            // })

            await Promise.all([
               queryClient.cancelQueries(listQueryOptions),
               // queryClient.cancelQueries(oneQueryOptions),
            ])

            await Promise.all([queryClient.cancelQueries(listQueryOptions)])

            const listData = queryClient.getQueryData(listQueryOptions.queryKey)
            // const oneData = maybeParams.clientId
            //    ? queryClient.getQueryData(oneQueryOptions.queryKey)
            //    : null

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
   // const params = useParams({ strict: false })
   // const navigate = useNavigate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const listQueryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return (input: RouterInput["client"]["delete"]) => {
      // const oneQueryKey = trpc.client.one.queryOptions({
      //    clientId: input.clientId,
      //    workspaceId: input.workspaceId,
      // }).queryKey

      queryClient.setQueryData(listQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((item) => item.id !== input.clientId)
      })
      // queryClient.setQueryData(oneQueryKey, (oldData) => {
      //    if (!oldData) return oldData
      //    if (params.clientId) {
      //       navigate({
      //          to: "/$workspaceId/clients",
      //          params: { workspaceId: input.workspaceId },
      //       })
      //    }
      //    return null
      // })
   }
}
