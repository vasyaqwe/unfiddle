import { useEventListener } from "@/interactions/use-event-listener"
import * as React from "react"

export function useDragState() {
   const [isDragging, setIsDragging] = React.useState(false)

   useEventListener("dragenter", (e) => {
      e.preventDefault()
      setIsDragging(true)
   })
   useEventListener("dragleave", (e) => {
      e.preventDefault()
      if (e.relatedTarget === null) setIsDragging(false)
   })
   useEventListener("drop", () => {
      setIsDragging(false)
   })

   return { isDragging }
}
