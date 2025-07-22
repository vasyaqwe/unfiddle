import { useAuth } from "@/auth/hooks"
import { useSocket } from "@/socket"
import { trpc } from "@/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateAttachment() {
   const queryClient = useQueryClient()
   const auth = useAuth()
   const socket = useSocket()

   return useMutation(
      trpc.attachment.create.mutationOptions({
         onSuccess: (attachment) => {
            socket.order.send({
               action: "create_attachement",
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
         },
      }),
   )
}
