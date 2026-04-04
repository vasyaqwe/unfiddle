import { useAttachments } from "@/attachment/hooks"
import { CreateMessage } from "@/chat/components/create-message"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/chat/store"
import {
   useCreateOrderMessage,
   useUpdateOrderMessage,
} from "@/order/message/mutations"
import { useOrderMessagesQuery } from "@/order/message/queries"
import { useParams } from "@tanstack/react-router"
import { useAtom } from "jotai"

export function CreateOrderMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   })
   const [_content, setContent] = useAtom(messageContentAtom)
   const content = _content[params.orderId] ?? ""
   const [editingMessageId, setEditingMessageId] = useAtom(editingMessageIdAtom)
   const [replyingToMessageId, setReplyingToMessageId] = useAtom(
      replyingToMessageIdAtom,
   )

   const create = useCreateOrderMessage()
   const update = useUpdateOrderMessage()
   const attachments = useAttachments({
      subjectId: `${params.orderId}_message`,
   })

   const { data: messages } = useOrderMessagesQuery(params.orderId)

   const replyingToMessage = replyingToMessageId
      ? messages?.find((m) => m.id === replyingToMessageId)
      : null

   return (
      <CreateMessage
         subjectId={params.orderId}
         replyingToMessage={replyingToMessage}
         onSubmit={() => {
            const hasContent = content.trim().length > 0
            const hasAttachments = attachments.uploaded.length > 0

            if (!hasContent && !hasAttachments) return

            if (editingMessageId) {
               update(editingMessageId, content)
               setEditingMessageId(null)
            } else {
               const parentId = replyingToMessage?.replyToId
                  ? replyingToMessage.replyToId
                  : replyingToMessage?.id
               create(
                  content,
                  parentId,
                  hasAttachments ? attachments.uploaded : undefined,
               )
            }
            setReplyingToMessageId(null)
            setContent((prev) => ({
               ...prev,
               [params.orderId]: "",
            }))
            attachments.clear()
         }}
      />
   )
}
