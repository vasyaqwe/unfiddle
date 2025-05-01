import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateProcurement({
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
      input: RouterOutput["order"]["list"][number]["procurements"][number] & {
         orderId: string
      }
   }) => {
      queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
         if (!oldData) return oldData
         return oldData.map((item) => {
            if (item.id === input.orderId)
               return { ...item, procurements: [input, ...item.procurements] }
            return item
         })
      })
   }

   const mutation = useMutation(
      trpc.procurement.create.mutationOptions({
         onMutate: async (input) => {
            await queryClient.cancelQueries(queryOptions)

            const data = queryClient.getQueryData(queryOptions.queryKey)
            if (!data) return

            mutateQueryData({
               input: {
                  ...input,
                  id: crypto.randomUUID(),
                  status: "pending",
                  buyer: auth.user,
                  note: input.note ?? "",
               },
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
