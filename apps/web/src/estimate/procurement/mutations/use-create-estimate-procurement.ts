import { useAuth } from "@/auth/hooks"
import { useEstimate } from "@/estimate/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { EstimateProcurement } from "@unfiddle/core/estimate/procurement/types"
import { toast } from "sonner"

export function useCreateEstimateProcurement({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const search = useSearch({ strict: false })
   const estimate = useEstimate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })
   const create = useOptimisticCreateEstimateProcurement()

   const queryOptions = trpc.estimateProcurement.list.queryOptions({
      estimateId: estimate.id,
      workspaceId: auth.workspace.id,
   })

   return useMutation(
      trpc.estimateProcurement.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await Promise.all([
               queryClient.cancelQueries(
                  trpc.estimate.one.queryOptions({
                     estimateId: input.estimateId,
                     workspaceId: input.workspaceId,
                  }),
               ),
               queryClient.cancelQueries(estimateQueryOptions),
               queryClient.cancelQueries(queryOptions),
            ])

            const estimate = queryClient.getQueryData(
               trpc.estimate.one.queryOptions({
                  estimateId: input.estimateId,
                  workspaceId: input.workspaceId,
               }).queryKey,
            )
            const procurements = queryClient.getQueryData(queryOptions.queryKey)
            const estimates = queryClient.getQueryData(
               estimateQueryOptions.queryKey,
            )
            const estimateItems = estimate?.items ?? []
            const estimateItem = estimateItems.find(
               (i) => i.id === input.estimateItemId,
            )
            if (!estimateItem) return { procurements, estimates }

            create({
               ...input,
               id: crypto.randomUUID(),
               creator: auth.user,
               note: input.note ?? "",
               provider: input.provider ?? null,
               estimateItemId: input.estimateItemId ?? null,
            })

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
         onSuccess: (procurement) => {
            socket.estimateProcurement.send({
               action: "create",
               senderId: auth.user.id,
               estimateProcurement: {
                  ...procurement,
                  creator: auth.user,
               },
            })
            // attachments.clear()
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticCreateEstimateProcurement() {
   const search = useSearch({ strict: false })
   const auth = useAuth()
   const queryClient = useQueryClient()
   const estimateQueryOptions = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   return (
      input: EstimateProcurement & {
         estimateId: string
      },
   ) => {
      const queryKey = trpc.estimateProcurement.list.queryOptions({
         estimateId: input.estimateId,
         workspaceId: auth.workspace.id,
      }).queryKey
      queryClient.setQueryData(queryKey, (oldData) => {
         if (!oldData) return oldData
         return [input, ...oldData]
      })
      queryClient.setQueryData(estimateQueryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.estimateId)
               return { ...item, procurements: [input, ...item.procurements] }
            return item
         })
      })
   }
}
