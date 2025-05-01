import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import type { RouterInput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDeleteProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()

   const queryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
   })

   const mutateQueryData = ({
      input,
   }: {
      input: RouterInput["procurement"]["delete"]
   }) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.id)
               return {
                  ...item,
                  procurements: item.procurements.filter(
                     (p) => p.id !== input.id,
                  ),
               }
            return item
         })
      })
   }

   const mutation = useMutation(
      trpc.procurement.delete.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)
            if (!data) return

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
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )

   return {
      mutateQueryData,
      ...mutation,
   }
}
