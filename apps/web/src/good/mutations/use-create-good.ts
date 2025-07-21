// import { useAuth } from "@/auth/hooks"
// import { trpc } from "@/trpc"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import type { RouterOutput } from "@unfiddle/core/trpc/types"
// import { toast } from "sonner"

// export function useCreateGood({
//    onError,
//    onSuccess,
// }: {
//    onError?: () => void
//    onSuccess?: (id: string) => void
// } = {}) {
//    const queryClient = useQueryClient()
//    const auth = useAuth()

//    const queryOptions = trpc.good.list.queryOptions({
//       workspaceId: auth.workspace.id,
//    })

//    return useMutation(
//       trpc.good.create.mutationOptions({
//          onMutate: async () => {
//             await queryClient.cancelQueries(queryOptions)

//             const data = queryClient.getQueryData(queryOptions.queryKey)

//             return { data }
//          },
//          onError: (error, _data, context) => {
//             queryClient.setQueryData(queryOptions.queryKey, context?.data)
//             toast.error("Ой-ой!", {
//                description: error.message,
//             })

//             onError?.()
//          },
//          onSuccess: (created) => {
//             queryClient
//                .invalidateQueries(queryOptions)
//                .then(() => onSuccess?.(created?.id ?? ""))
//          },
//       }),
//    )
// }

// export function useOptimisticCreateGood() {
//    const queryClient = useQueryClient()
//    const auth = useAuth()

//    return (input: RouterOutput["good"]["list"][number]) => {
//       queryClient.setQueryData(
//          trpc.good.list.queryOptions({ workspaceId: auth.workspace.id })
//             .queryKey,
//          (oldData) => {
//             if (!oldData) return oldData
//             return [input, ...oldData]
//          },
//       )
//    }
// }
