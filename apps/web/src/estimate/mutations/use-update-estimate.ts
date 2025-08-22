import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateEstimate({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const search = useSearch({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateEstimate()
   const queryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimate.update.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await queryClient.cancelQueries(queryOptions)

            const listData = queryClient.getQueryData(queryOptions.queryKey)
            update(input)

            return { listData }
         },
         onError: (error, _input, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.listData)
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
         onSettled: (_data, _error, _input) => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticUpdateEstimate() {
   const search = useSearch({ strict: false })
   const auth = useAuth()
   const queryClient = useQueryClient()
   const queryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return async (input: RouterInput["estimate"]["update"]) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.estimateId) return { ...item, ...input }
            return item
         })
      })
   }
}
