import { UploadedAttachment } from "@/attachment/components/uploaded-attachment"
import { useAttachments } from "@/attachment/hooks"
import { useAuth } from "@/auth/hooks"
import { FileUploader } from "@/file/components/uploader"
import {
   useCreateOrderMessage,
   useUpdateOrderMessage,
} from "@/order/message/mutations"
import { useOrderMessagesQuery } from "@/order/message/queries"
import {
   editingMessageIdAtom,
   messageContentAtom,
   replyingToMessageIdAtom,
} from "@/order/message/store"
import { useParams } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Textarea } from "@unfiddle/ui/components/textarea"
import { useAtom } from "jotai"
import * as React from "react"
import { useHotkeys } from "react-hotkeys-hook"

export function CreateOrderMessage({ onSuccess }: { onSuccess?: () => void }) {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId/_layout/chat",
   })
   const auth = useAuth()
   const [_content, setContent] = useAtom(messageContentAtom)
   const content = _content[params.orderId] ?? ""
   const [editingMessageId, setEditingMessageId] = useAtom(editingMessageIdAtom)
   const [replyingToMessageId, setReplyingToMessageId] = useAtom(
      replyingToMessageIdAtom,
   )

   const formRef = React.useRef<HTMLFormElement>(null)
   const textareaRef = React.useRef<HTMLTextAreaElement>(null)
   const fileUploaderRef = React.useRef<HTMLDivElement>(null)

   const create = useCreateOrderMessage()
   const update = useUpdateOrderMessage()
   const attachments = useAttachments({
      subjectId: `${params.orderId}_message`,
   })

   const { data: messages } = useOrderMessagesQuery(params.orderId)

   const replyingToMessage = replyingToMessageId
      ? messages?.find((m) => m.id === replyingToMessageId)
      : null

   const cancelEditing = () => {
      setEditingMessageId(null)
      setReplyingToMessageId(null)
      setContent((prev) => ({
         ...prev,
         [params.orderId]: "",
      }))
      attachments.clear()
   }

   useHotkeys(["Esc"], cancelEditing)

   React.useEffect(() => {
      textareaRef.current?.focus()

      const onVisibilityChange = () => {
         if (document.visibilityState === "visible") {
            textareaRef.current?.focus()
         }
      }
      document.addEventListener("visibilitychange", onVisibilityChange)
      return () =>
         document.removeEventListener("visibilitychange", onVisibilityChange)
   }, [])

   return (
      <>
         <form
            ref={formRef}
            onSubmit={async (e) => {
               e.preventDefault()
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

               onSuccess?.()
            }}
            className="relative z-60 max-h-[50svh] overflow-auto border-neutral border-t bg-background"
         >
            {replyingToMessage && (
               <div className="flex w-full items-center justify-between gap-2 border-neutral border-b bg-surface-2 px-3 py-2 text-muted text-sm">
                  <div className="flex w-full items-center gap-2">
                     <Icons.arrowDownLeft className="size-4 shrink-0" />
                     <span className="line-clamp-1">
                        Відповідь до{" "}
                        {replyingToMessage.creator.id === auth.user.id
                           ? "себе"
                           : replyingToMessage.creator.name}{" "}
                        {replyingToMessage.content.length === 0
                           ? null
                           : `'${replyingToMessage.content}'`}
                     </span>
                  </div>
                  <Button
                     type="button"
                     kind="icon"
                     variant="ghost"
                     size="sm"
                     onClick={() => setReplyingToMessageId(null)}
                  >
                     <Icons.xMark />
                  </Button>
               </div>
            )}
            {attachments.uploaded.length > 0 && (
               <div className="flex flex-wrap gap-2 px-3 pt-3">
                  {attachments.uploaded.map((file) => (
                     <UploadedAttachment
                        key={file.id}
                        file={file}
                        onRemove={() => attachments.remove(file.id)}
                     />
                  ))}
               </div>
            )}
            <div className="flex w-full items-end gap-2 pr-1.75 pl-1.5 md:pr-2.5 md:pl-2.5">
               <Button
                  type="button"
                  onClick={() => fileUploaderRef.current?.click()}
                  className={"sticky bottom-1.5 rounded-full md:bottom-2.25"}
                  kind={"icon"}
                  variant={"ghost"}
               >
                  <Icons.paperClip />
               </Button>
               <Textarea
                  data-chat-content
                  ref={textareaRef}
                  className="border-b-0 pt-3.5! pb-3.5! md:pt-3.5! md:pb-3.5!"
                  placeholder="Напишіть повідомлення..."
                  value={content}
                  onChange={(e) =>
                     setContent((prev) => ({
                        ...prev,
                        [params.orderId]: e.target.value,
                     }))
                  }
                  onKeyDown={(e) => {
                     if (e.key === "Escape") return cancelEditing()

                     if (
                        e.key === "Enter" &&
                        content.length === 0 &&
                        attachments.uploaded.length === 0
                     )
                        return e.preventDefault()

                     if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        return formRef.current?.requestSubmit()
                     }
                  }}
                  onPaste={(e) => attachments.onPaste(e)}
               />
               <Button
                  type="submit"
                  disabled={
                     content.trim().length === 0 &&
                     attachments.uploaded.length === 0
                  }
                  className={"sticky bottom-1.5 rounded-full md:bottom-2.25"}
                  kind={"icon"}
               >
                  {editingMessageId ? <Icons.check /> : <Icons.arrowUp />}
               </Button>
            </div>
         </form>
         <FileUploader
            ref={fileUploaderRef}
            className="absolute inset-0 z-9"
            onUpload={attachments.upload.mutateAsync}
         />
      </>
   )
}
