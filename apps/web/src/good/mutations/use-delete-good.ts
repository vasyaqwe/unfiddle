// import { useAuth } from "@/auth/hooks"
// import { trpc } from "@/trpc"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import type { RouterInput } from "@unfiddle/core/trpc/types"
// import { toast } from "sonner"

// export function useDeleteGood({
//    onMutate,
//    onError,
// }: { onMutate?: () => void; onError?: () => void } = {}) {
//    const queryClient = useQueryClient()
//    const auth = useAuth()
//    const deleteItem = useOptimisticDeleteGood()

//    const queryOptions = trpc.good.list.queryOptions({
//       workspaceId: auth.workspace.id,
//    })

//    return useMutation(
//       trpc.good.delete.mutationOptions({
//          onMutate: async (input) => {
//             await queryClient.cancelQueries(queryOptions)

//             const data = queryClient.getQueryData(queryOptions.queryKey)

//             deleteItem(input)

//             onMutate?.()

//             return { data }
//          },
//          onError: (error, _data, context) => {
//             queryClient.setQueryData(queryOptions.queryKey, context?.data)
//             toast.error("Ой-ой!", {
//                description: error.message,
//             })

//             onError?.()
//          },
//          onSettled: () => {
//             queryClient.invalidateQueries(queryOptions)
//          },
//       }),
//    )
// }

// export function useOptimisticDeleteGood() {
//    const queryClient = useQueryClient()
//    const auth = useAuth()

//    return (input: RouterInput["order"]["delete"]) => {
//       queryClient.setQueryData(
//          trpc.good.list.queryOptions({ workspaceId: auth.workspace.id })
//             .queryKey,
//          (oldData) => {
//             if (!oldData) return oldData
//             return oldData.filter((item) => item.id !== input.id)
//          },
//       )
//    }
// }
