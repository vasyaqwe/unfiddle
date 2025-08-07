import "tldraw/tldraw.css"
import { useAuth } from "@/auth/hooks"
import { useSyncStore } from "@/whiteboard/hooks"
import { createFileRoute } from "@tanstack/react-router"
import React from "react"
import { Tldraw, track, useEditor } from "tldraw"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/board")({
   component: RouteComponent,
})

function RouteComponent() {
   const params = Route.useParams()
   const store = useSyncStore({
      roomId: params.workspaceId,
   })

   return (
      <div style={{ position: "fixed", inset: 0 }}>
         <Tldraw
            autoFocus
            store={store}
            components={{
               SharePanel: NameEditor,
            }}
         />
      </div>
   )
}

const NameEditor = track(() => {
   const auth = useAuth()
   const editor = useEditor()

   React.useEffect(() => {
      if (editor && !editor.user.getUserPreferences().name) {
         editor.user.updateUserPreferences({
            name: auth.user.name,
         })
      }
   }, [editor])

   return null
})
