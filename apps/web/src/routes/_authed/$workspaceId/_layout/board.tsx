import "@tldraw/tldraw/tldraw.css"
import { useYjsStore } from "@/board/hooks"
import { BoardProvider, useBoard } from "@/board/provider"
import { env } from "@/env"
import { createFileRoute } from "@tanstack/react-router"
import { Tldraw } from "@tldraw/tldraw"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/board")({
   component: RouteComponent,
})

function RouteComponent() {
   return (
      <div style={{ position: "fixed", inset: 0 }}>
         <BoardProvider>
            <Content />
         </BoardProvider>
      </div>
   )
}

function Content() {
   const params = Route.useParams()
   const board = useBoard()
   const store = useYjsStore({
      roomId: params.workspaceId,
      hostUrl: `${env.COLLABORATION_URL}/parties/board`,
   })

   return (
      <Tldraw
         store={store}
         onMount={board.setEditor}
      />
   )
}
