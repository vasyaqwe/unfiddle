import { useAuth } from "@/auth/hooks"
import type { Virtualizer } from "@tanstack/react-virtual"
import * as React from "react"

export function useInitialScrollToBottom(
   virtualizer: Virtualizer<HTMLDivElement, Element>,
   rowsLength: number,
) {
   const hasScrolledInitiallyRef = React.useRef(false)

   React.useLayoutEffect(() => {
      if (!hasScrolledInitiallyRef.current && rowsLength > 0) {
         requestAnimationFrame(() => {
            virtualizer.scrollToIndex(rowsLength - 1, { align: "end" })
            hasScrolledInitiallyRef.current = true
         })
      }
   }, [rowsLength, virtualizer])
}

export function useAutoScrollOnNewMessage(
   virtualizer: Virtualizer<HTMLDivElement, Element>,
   scrollAreaRef: React.RefObject<HTMLDivElement | null>,
   rows: Array<{ message?: { creatorId: string } }>,
) {
   const prevRowsLengthRef = React.useRef(0)
   const auth = useAuth()

   React.useLayoutEffect(() => {
      if (rows.length > prevRowsLengthRef.current && rows.length > 0) {
         const lastMessage = rows[rows.length - 1]
         const viewerIsSender = lastMessage?.message?.creatorId === auth.user.id

         if (viewerIsSender) {
            virtualizer.scrollToIndex(rows.length - 1, {
               align: "end",
               behavior: "smooth",
            })
         } else {
            const scrollElement = scrollAreaRef.current
            if (scrollElement) {
               const isAtBottom =
                  scrollElement.scrollHeight -
                     scrollElement.scrollTop -
                     scrollElement.clientHeight <
                  100

               if (isAtBottom) {
                  virtualizer.scrollToIndex(rows.length - 1, {
                     align: "end",
                     behavior: "smooth",
                  })
               }
            }
         }
      }
      prevRowsLengthRef.current = rows.length
   }, [rows.length, virtualizer, scrollAreaRef])
}
