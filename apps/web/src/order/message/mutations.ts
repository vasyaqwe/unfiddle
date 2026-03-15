import { useAuth } from "@/auth/hooks"
import { createId } from "@/id"
import { orderMessageCollection } from "@/order/message/collection"
import { useSocket } from "@/socket"
import { useParams } from "@tanstack/react-router"

export function useCreateOrderMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = orderMessageCollection(params.orderId, auth.workspace.id)

   return (content: string, replyToId?: string) => {
      const id = createId("order_message")

      const replyMessage = replyToId ? collection.get(replyToId) : null

      collection.insert({
         id,
         orderId: params.orderId,
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
      })

      const message = collection.get(id)
      if (!message) return

      socket.order.send({
         action: "create_message",
         senderId: auth.user.id,
         workspaceId: auth.workspace.id,
         orderId: params.orderId,
         message,
      })
   }
}

export function useUpdateOrderMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = orderMessageCollection(params.orderId, auth.workspace.id)

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

      socket.order.send({
         action: "update_message",
         senderId: auth.user.id,
         orderId: message.orderId,
         message: { ...message, orderMessageId: messageId },
      })
   }
}

export function useDeleteOrderMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout",
   })
   const auth = useAuth()
   const socket = useSocket()
   const collection = orderMessageCollection(params.orderId, auth.workspace.id)

   return (messageId: string) => {
      const message = collection.get(messageId)
      if (!message) return

      collection.delete(messageId)

      socket.order.send({
         action: "delete_message",
         senderId: auth.user.id,
         orderId: message.orderId,
         orderMessageId: messageId,
         workspaceId: auth.workspace.id,
      })
   }
}
