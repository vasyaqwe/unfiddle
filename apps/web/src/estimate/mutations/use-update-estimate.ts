import { CACHE_SHORT } from "@/api"
import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateEstimate({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const maybeParams = useParams({ strict: false })
   const search = useSearch({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateEstimate()
   const listQueryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimate.update.mutationOptions({
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

            const listData = queryClient.getQueryData(listQueryOptions.queryKey)
            const oneData = maybeParams.estimateId
               ? queryClient.getQueryData(oneQueryOptions.queryKey)
               : null

            update(input)

            return { listData, oneData }
         },
         onError: (error, input, context) => {
            queryClient.setQueryData(
               trpc.estimate.one.queryOptions({
                  estimateId: input.estimateId,
                  workspaceId: input.workspaceId,
               }).queryKey,
               context?.oneData,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSuccess: (_, estimate) => {
            socket.estimate.send({
               action: "update",
               senderId: auth.user.id,
               estimate,
            })
         },
         onSettled: (_data, _error, input) => {
            const oneQueryOptions = trpc.estimate.one.queryOptions({
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
            })
            queryClient.invalidateQueries(oneQueryOptions)
         },
      }),
   )
}

export function useOptimisticUpdateEstimate() {
   const search = useSearch({ strict: false })
   const auth = useAuth()
   const queryClient = useQueryClient()
   const listQueryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })
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

   return async (input: RouterInput["estimate"]["update"]) => {
      const oneQueryKey = trpc.estimate.one.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey

      queryClient.setQueryData(oneQueryKey, (oldData) => {
         if (!oldData) return oldData
         return {
            ...oldData,
            ...input,
            client: clients.find((c) => c.id === input.clientId) ?? null,
         }
      })
      queryClient.setQueryData(listQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.estimateId)
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
