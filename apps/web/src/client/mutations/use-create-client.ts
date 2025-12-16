import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useCreateClient({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const queryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })
   const create = useOptimisticCreateClient()

   return useMutation(
      trpc.client.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               name: input.name,
               severity: input.severity ?? "low",
               createdAt: new Date(),
            })

            return { data }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.data)
            toast.error("Ой-ой!", {
               description: error.message,
            })
            onError?.()
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticCreateClient() {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const queryOptions = trpc.client.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   return (input: RouterOutput["client"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData

         return [input, ...oldData]
      })
   }
}
