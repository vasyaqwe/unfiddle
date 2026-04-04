import { useAttachments } from "@/attachment/hooks"
import { CreateMessage } from "@/chat/components/create-message"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/chat/store"
import {
   useCreateEstimateMessage,
   useUpdateEstimateMessage,
} from "@/estimate/message/mutations"
import { useEstimateMessagesQuery } from "@/estimate/message/queries"
import { useParams } from "@tanstack/react-router"
import { useAtom } from "jotai"

export function CreateEstimateMessage() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout/chat",
   })
   const [_content, setContent] = useAtom(messageContentAtom)
   const content = _content[params.estimateId] ?? ""
   const [editingMessageId, setEditingMessageId] = useAtom(editingMessageIdAtom)
   const [replyingToMessageId, setReplyingToMessageId] = useAtom(
      replyingToMessageIdAtom,
   )

   const create = useCreateEstimateMessage()
   const update = useUpdateEstimateMessage()
   const attachments = useAttachments({
      subjectId: `${params.estimateId}_message`,
   })

   const { data: messages } = useEstimateMessagesQuery(params.estimateId)

   const replyingToMessage = replyingToMessageId
      ? messages?.find((m) => m.id === replyingToMessageId)
      : null

   return (
      <CreateMessage
         subjectId={params.estimateId}
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
               [params.estimateId]: "",
            }))
            attachments.clear()
         }}
      />
   )
}
