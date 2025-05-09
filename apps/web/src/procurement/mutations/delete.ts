import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import type { RouterInput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { toast } from "sonner"

export function useDeleteProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const search = useSearch({ strict: false })

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   const mutateQueryData = ({
      input,
   }: {
      input: RouterInput["procurement"]["delete"]
   }) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => ({
            ...item,
            procurements: item.procurements.filter((p) => p.id !== input.id),
         }))
      })
   }

   const mutation = useMutation(
      trpc.procurement.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            mutateQueryData({
               input,
            })

            onMutate?.()

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
            queryClient.invalidateQueries(
               trpc.workspace.summary.queryOptions({
                  id: auth.workspace.id,
               }),
            )
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )

   return {
      mutateQueryData,
      ...mutation,
   }
}
