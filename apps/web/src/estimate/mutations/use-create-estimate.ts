import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { toast } from "sonner"

export function useCreateEstimate({
   onMutate,
   onError,
}: { onMutate?: () => void; onError?: () => void } = {}) {
   const search = useSearch({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()
   const queryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })
   const create = useOptimisticCreateEstimate()
   const attachments = useAttachments({ subjectId: auth.workspace.id })

   return useMutation(
      trpc.estimate.create.mutationOptions({
         onMutate: async (input) => {
            onMutate?.()

            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)

            create({
               ...input,
               id: crypto.randomUUID(),
               shortId: 0,
               creator: auth.user,
               currency: input.currency ?? "UAH",
               sellingPrice: input.sellingPrice ?? 0,
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
         onSuccess: (estimate) => {
            socket.estimate.send({
               action: "create",
               senderId: auth.user.id,
               estimate: {
                  ...estimate,
                  creator: auth.user,
                  currency: estimate.currency ?? "UAH",
                  sellingPrice: estimate.sellingPrice ?? 0,
                  createdAt: new Date(),
               },
            })
            attachments.clear()
            // notify({
            //    title: `➕ ${auth.user.name} додав замовлення`,
            //    body: estimate.name,
            //    priority: estimate.severity === "high" ? "max" : "default",
            // })
         },
         onSettled: () => {
            queryClient.invalidateQueries(queryOptions)
         },
      }),
   )
}

export function useOptimisticCreateEstimate() {
   const search = useSearch({ strict: false })
   const queryClient = useQueryClient()
   const auth = useAuth()
   const queryOptions = trpc.estimate.list.queryOptions({
      filter: search,
      workspaceId: auth.workspace.id,
   })

   return (input: RouterOutput["estimate"]["list"][number]) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData

         return [input, ...oldData]
      })
   }
}
