import { Home01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import "tldraw/tldraw.css"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Tldraw, track } from "tldraw"
import { useAuth } from "@/auth/hooks"
import { SuspenseFallback } from "@/ui/components/suspense-boundary"
import { useSyncStore } from "@/whiteboard/hooks"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/board")({
   component: RouteComponent,
})

function RouteComponent() {
   const params = Route.useParams()
   const store = useSyncStore({
      roomId: params.workspaceId,
   })

   if (store.status !== "synced-remote") return <SuspenseFallback />

   return (
      <div className="fixed inset-0">
         <Tldraw
            autoFocus
            store={store.store}
         />
         <Button
            render={
               <Link
                  to={"/$workspaceId"}
                  params={params}
               />
            }
            size="lg"
            className={"absolute right-1 bottom-1 z-999 min-w-25"}
            style={{ color: "white" }}
         >
            <HugeiconsIcon icon={Home01Icon} />
            Додому
         </Button>
      </div>
   )
}

const _NameEditor = track(() => {
   const _auth = useAuth()

   return null
})
