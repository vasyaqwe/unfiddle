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

   return (content: string) => {
      const id = createId("order_message")
      collection.insert({
         id,
         orderId: params.orderId,
         workspaceId: auth.workspace.id,
         creatorId: auth.user.id,
         content,
         createdAt: new Date(),
         updatedAt: new Date(),
         creator: {
            id: auth.user.id,
            name: auth.user.name,
            image: auth.user.image,
         },
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
