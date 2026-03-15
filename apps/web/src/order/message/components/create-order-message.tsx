import {
   useCreateOrderMessage,
   useUpdateOrderMessage,
} from "@/order/message/mutations"
import { editingMessageIdAtom, messageContentAtom } from "@/order/message/store"
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
   const [_content, setContent] = useAtom(messageContentAtom)
   const content = _content[params.orderId] ?? ""
   const [editingMessageId, setEditingMessageId] = useAtom(editingMessageIdAtom)

   const formRef = React.useRef<HTMLFormElement>(null)
   const textareaRef = React.useRef<HTMLTextAreaElement>(null)

   const create = useCreateOrderMessage()
   const update = useUpdateOrderMessage()

   const cancelEditing = () => {
      setEditingMessageId(null)
      setContent((prev) => ({
         ...prev,
         [params.orderId]: "",
      }))
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
      <div className="z-60 max-h-[50svh] overflow-auto border-neutral border-t bg-background pr-1.75 pl-3.5 md:pr-2.5 md:pl-5">
         <form
            ref={formRef}
            onSubmit={async (e) => {
               e.preventDefault()
               if (content.trim().length === 0) return

               if (editingMessageId) {
                  update(editingMessageId, content)
                  setEditingMessageId(null)
               } else {
                  create(content)
               }
               setContent((prev) => ({
                  ...prev,
                  [params.orderId]: "",
               }))

               onSuccess?.()
            }}
            className="flex items-end gap-2"
         >
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

                  if (e.key === "Enter" && content.length === 0)
                     return e.preventDefault()

                  if (e.key === "Enter" && !e.shiftKey) {
                     e.preventDefault()
                     return formRef.current?.requestSubmit()
                  }
               }}
            />
            <Button
               type="submit"
               disabled={content.trim().length === 0}
               className={"sticky bottom-1.5 rounded-full md:bottom-2.25"}
               kind={"icon"}
            >
               {editingMessageId ? <Icons.check /> : <Icons.arrowUp />}
            </Button>
         </form>
      </div>
   )
}
