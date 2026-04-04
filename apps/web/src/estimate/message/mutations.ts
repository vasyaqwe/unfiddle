import type { UploadedAttachment } from "@/attachment/types"
import { useAuth } from "@/auth/hooks"
import { estimateMessageCollection } from "@/estimate/message/collection"
import { createId } from "@/id"
import { useSocket } from "@/socket"
import { useParams } from "@tanstack/react-router"

export function useCreateEstimateMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = estimateMessageCollection(
      params.estimateId,
      auth.workspace.id,
   )

   return (
      content: string,
      replyToId?: string,
      attachments?: UploadedAttachment[],
   ) => {
      const id = createId("estimate_message")

      const replyMessage = replyToId ? collection.get(replyToId) : null

      collection.insert({
         id,
         estimateId: params.estimateId,
         workspaceId: auth.workspace.id,
         creatorId: auth.user.id,
         content,
         replyToId: replyToId ?? null,
         createdAt: new Date(),
         updatedAt: new Date(),
         creator: {
            id: auth.user.id,
            name: auth.user.name,
            image: auth.user.image,
         },
         reply: replyMessage
            ? {
                 id: replyMessage.id,
                 content: replyMessage.content,
                 creatorId: replyMessage.creatorId,
                 creator: replyMessage.creator,
              }
            : null,
         attachments:
            attachments?.map((a) => ({
               id: a.id,
               name: a.name,
               type: a.type,
               url: a.url,
               size: a.size,
               width: a.width ?? null,
               height: a.height ?? null,
            })) ?? [],
      })

      const message = collection.get(id)
      if (!message) return

      socket.estimate.send({
         action: "create_message",
         senderId: auth.user.id,
         workspaceId: auth.workspace.id,
         estimateId: params.estimateId,
         message,
      })
   }
}

export function useUpdateEstimateMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = estimateMessageCollection(
      params.estimateId,
      auth.workspace.id,
   )

   return (messageId: string, content: string) => {
      collection.update(messageId, (draft) => {
         draft.content = content
         draft.updatedAt = new Date()
      })

      const message = collection.get(messageId)
      if (!message) return

      // Update reply objects in all messages that reference this message
      for (const [, msg] of collection.entries()) {
         if (msg.replyToId === messageId && msg.reply) {
            collection.update(msg.id, (draft) => {
               if (draft.reply) {
                  draft.reply.content = content
               }
            })
         }
      }

      socket.estimate.send({
         action: "update_message",
         senderId: auth.user.id,
         estimateId: message.estimateId,
         message: { ...message, estimateMessageId: messageId },
      })
   }
}

export function useDeleteEstimateMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = estimateMessageCollection(
      params.estimateId,
      auth.workspace.id,
   )

   return (messageId: string) => {
      const message = collection.get(messageId)
      if (!message) return

      collection.delete(messageId)

      socket.estimate.send({
         action: "delete_message",
         senderId: auth.user.id,
         estimateId: message.estimateId,
         estimateMessageId: messageId,
         workspaceId: auth.workspace.id,
      })
   }
}
