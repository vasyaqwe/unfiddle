import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterInput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useUpdateEstimateProcurement({
   onMutate,
   onError,
   onSuccess,
}: {
   onMutate?: () => void
   onError?: () => void
   onSuccess?: () => void
} = {}) {
   const search = useSearch({ strict: false })
   const estimate = useEstimate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const update = useOptimisticUpdateEstimateProcurement()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })
   const queryOptions = trpc.estimateProcurement.list.queryOptions({
      estimateId: estimate.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimateProcurement.update.mutationOptions({
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

            update({ ...input, estimateId: estimate.id })

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
         onSuccess: (_data, estimateProcurement) => {
            socket.estimateProcurement.send({
               action: "update",
               senderId: auth.user.id,
               estimateProcurement,
            })
            onSuccess?.()
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
            queryClient.invalidateQueries(estimateQueryOptions)
         },
      }),
   )
}

export function useOptimisticUpdateEstimateProcurement() {
   const search = useSearch({ strict: false })
   const auth = useAuth()
   const queryClient = useQueryClient()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   return async (input: RouterInput["estimateProcurement"]["update"]) => {
      const queryKey = trpc.estimateProcurement.list.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((p) => {
            if (p.id === input.estimateProcurementId)
               return {
                  ...p,
                  ...input,
               }
            return p
         })
      })
      queryClient.setQueryData(estimateQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.estimateId)
               return {
                  ...item,
                  procurements: item.procurements.map((p) => {
                     if (p.id === input.estimateProcurementId)
                        return { ...p, ...input }
                     return p
                  }),
               }
            return item
         })
      })
   }
}
