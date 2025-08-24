import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteEstimate({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const search = useSearch({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteItem = useOptimisticDeleteEstimate()
   const listQueryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimate.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            const oneQueryOptions = trpc.estimate.one.queryOptions({
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
            })

            await Promise.all([
               queryClient.cancelQueries(listQueryOptions),
               queryClient.cancelQueries(oneQueryOptions),
            ])

            await Promise.all([queryClient.cancelQueries(listQueryOptions)])

            const listData = queryClient.getQueryData(listQueryOptions.queryKey)
            const oneData = maybeParams.estimateId
               ? queryClient.getQueryData(oneQueryOptions.queryKey)
               : null

            deleteItem(input)

            return { listData, oneData }
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
         onSuccess: (_, data) => {
            socket.estimate.send({
               action: "delete",
               senderId: auth.user.id,
               estimateId: data.estimateId,
               workspaceId: auth.workspace.id,
            })
         },
         onSettled: (_data, _error, _input) => {
            queryClient.invalidateQueries(listQueryOptions)
         },
      }),
   )
}

export function useOptimisticDeleteEstimate() {
   const params = useParams({ strict: false })
   const search = useSearch({ strict: false })
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const listQueryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return (input: RouterInput["estimate"]["delete"]) => {
      const oneQueryKey = trpc.estimate.one.queryOptions({
         estimateId: input.estimateId,
         workspaceId: input.workspaceId,
      }).queryKey

      queryClient.setQueryData(listQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((item) => item.id !== input.estimateId)
      })
      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         if (params.estimateId) {
            navigate({
               to: "/$workspaceId/estimates",
               params: { workspaceId: input.workspaceId },
            })
         }
         return null
      })
   }
}
