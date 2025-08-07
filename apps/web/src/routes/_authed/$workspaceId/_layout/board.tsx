import "tldraw/tldraw.css"
import { useAuth } from "@/auth/hooks"
import { SuspenseFallback } from "@/ui/components/suspense-boundary"
import { useSyncStore } from "@/whiteboard/hooks"
import { Link, createFileRoute } from "@tanstack/react-router"
import { button } from "@unfiddle/ui/components/button/constants"
import { Icons } from "@unfiddle/ui/components/icons"
import { cn } from "@unfiddle/ui/utils"
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
         <Link
            className={cn(
               button({ size: "lg" }),
               "absolute right-1 bottom-1 z-[999] min-w-[100px]",
            )}
            to={"/$workspaceId"}
            style={{ color: "white" }}
            params={params}
         >
            <Icons.home className="size-5" />
            Додому
         </Link>
      </div>
   )
}

const _NameEditor = track(() => {
   const _auth = useAuth()

   return null
})
