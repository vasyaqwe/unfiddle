import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteAttachment({
   onSuccess,
}: { onSuccess?: () => void } = {}) {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()

   return useMutation(
      trpc.attachment.delete.mutationOptions({
         onSuccess: (_, attachment) => {
            socket.order.send({
               action: "delete_attachment",
               senderId: auth.user.id,
               orderId: attachment.subjectId,
               workspaceId: auth.workspace.id,
            })
            queryClient.invalidateQueries(
               trpc.order.one.queryOptions({
                  orderId: attachment.subjectId,
                  workspaceId: auth.workspace.id,
               }),
            )
            onSuccess?.()
         },
      }),
   )
}
