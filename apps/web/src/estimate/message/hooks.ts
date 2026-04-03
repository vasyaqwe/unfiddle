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

export function useOnMessageInsert(
   rows: Array<{ message?: { creatorId: string } }>,
   cb: (viewerIsSender: boolean) => void,
) {
   const prevRowsLengthRef = React.useRef<number | null>(null)
   const cbRef = React.useRef(cb)
   cbRef.current = cb
   const auth = useAuth()

   React.useLayoutEffect(() => {
      // Skip initial load (null -> any), only trigger on actual inserts
      if (
         prevRowsLengthRef.current !== null &&
         rows.length > prevRowsLengthRef.current
      ) {
         const lastMessage = rows[rows.length - 1]
         const viewerIsSender = lastMessage?.message?.creatorId === auth.user.id
         cbRef.current(viewerIsSender)
      }
      prevRowsLengthRef.current = rows.length
   }, [rows.length, auth.user.id])
}

export function useOnMessageDelete(
   rows: Array<{ message?: { creatorId: string; id: string } }>,
   cb: (viewerIsSender: boolean) => void,
) {
   const prevRowsLengthRef = React.useRef(0)
   const prevRowsRef = React.useRef(rows)
   const auth = useAuth()

   React.useLayoutEffect(() => {
      if (rows.length < prevRowsLengthRef.current) {
         // Find the deleted message by comparing previous rows
         const deletedMessage = prevRowsRef.current.find(
            (prevRow) =>
               !rows.some((row) => row.message?.id === prevRow.message?.id),
         )
         const viewerIsSender =
            deletedMessage?.message?.creatorId === auth.user.id
         cb(viewerIsSender)
      }
      prevRowsLengthRef.current = rows.length
      prevRowsRef.current = rows
   }, [rows, auth.user.id, cb])
}
