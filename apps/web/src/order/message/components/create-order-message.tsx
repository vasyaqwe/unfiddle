import { useCreateOrderMessage } from "@/order/message/mutations"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Textarea } from "@unfiddle/ui/components/textarea"
import * as React from "react"

export function CreateOrderMessage() {
   const [content, setContent] = React.useState("")

   const formRef = React.useRef<HTMLFormElement>(null)

   const createMessage = useCreateOrderMessage()

   return (
      <div className="max-h-[50svh] overflow-auto border-neutral border-t pr-1.75 pl-3.5 md:pr-2.5 md:pl-5">
         <form
            ref={formRef}
            onSubmit={async (e) => {
               e.preventDefault()
               if (content.trim().length === 0) return

               const messageContent = content
               setContent("")
               createMessage(messageContent)
            }}
            className="flex items-end gap-2"
         >
            <Textarea
               className="border-b-0 pt-3.5! pb-3.5! md:pt-3.5! md:pb-3.5!"
               placeholder="Напишіть повідомлення..."
               value={content}
               onChange={(e) => setContent(e.target.value)}
               onKeyDown={(e) => {
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
               <Icons.arrowUp />
            </Button>
         </form>
      </div>
   )
}
