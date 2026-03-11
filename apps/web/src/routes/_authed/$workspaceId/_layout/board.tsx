import "tldraw/tldraw.css"
import { useAuth } from "@/auth/hooks"
import { SuspenseFallback } from "@/ui/components/suspense-boundary"
import { useSyncStore } from "@/whiteboard/hooks"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Icons } from "@unfiddle/ui/components/icons"
import { Tldraw, track } from "tldraw"

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
            <Icons.home className="size-5" />
            Додому
         </Button>
      </div>
   )
}

const _NameEditor = track(() => {
   const _auth = useAuth()

   return null
})
