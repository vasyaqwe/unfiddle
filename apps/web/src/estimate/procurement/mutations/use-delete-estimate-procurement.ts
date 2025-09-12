import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useDeleteEstimateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const search = useSearch({ strict: false })
   const estimate = useEstimate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const deleteItem = useOptimisticDeleteProcurement()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })
   const queryOptions = trpc.estimateProcurement.list.queryOptions({
      estimateId: estimate.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimateProcurement.delete.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await Promise.all([
               queryClient.cancelQueries(estimateQueryOptions),
               queryClient.cancelQueries(queryOptions),
            ])

            const procurements = queryClient.getQueryData(queryOptions.queryKey)
            const estimates = queryClient.getQueryData(
               estimateQueryOptions.queryKey,
            )

            deleteItem(input)

            return { procurements, estimates }
         },
         onError: (error, _data, context) => {
            queryClient.setQueryData(
               queryOptions.queryKey,
               context?.procurements,
            )
            queryClient.setQueryData(
               estimateQueryOptions.queryKey,
               context?.estimates,
            )
            toast.error("Ой-ой!", {
               description: error.message,
            })

            onError?.()
         },
         onSuccess: (_, data) => {
            socket.estimateProcurement.send({
               action: "delete",
               senderId: auth.user.id,
               estimateProcurementId: data.estimateProcurementId,
               estimateId: data.estimateId,
               workspaceId: auth.workspace.id,
            })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
            queryClient.invalidateQueries(estimateQueryOptions)
         },
      }),
   )
}

export function useOptimisticDeleteProcurement() {
   const search = useSearch({ strict: false })
   const auth = useAuth()
   const queryClient = useQueryClient()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   return (input: RouterInput["estimateProcurement"]["delete"]) => {
      const queryKey = trpc.estimateProcurement.list.queryOptions({
         estimateId: input.estimateProcurementId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.filter((p) => p.id !== input.estimateProcurementId)
      })
      queryClient.setQueryData(estimateQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.estimateId)
               return {
                  ...item,
                  procurements: item.procurements.filter(
                     (p) => p.id !== input.estimateProcurementId,
                  ),
               }
            return item
         })
      })
   }
}
