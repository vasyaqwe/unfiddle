import { CACHE_FOREVER } from "@/api"
import { BottomNavigation } from "@/layout/components/bottom-navigation"
import { Main } from "@/layout/components/main"
import { PendingComponent } from "@/layout/components/pending-component"
import { Sidebar } from "@/layout/components/sidebar"
import { SidebarContent } from "@/layout/components/sidebar"
import { SocketProvider } from "@/socket/provider"
import { trpc } from "@/trpc"
import { validator } from "@/validator"
import {
   Outlet,
   createFileRoute,
   notFound,
   useMatches,
} from "@tanstack/react-router"
import { z } from "zod"

export const Route = createFileRoute("/_authed/$workspaceId/_layout")({
   component: RouteComponent,
   validateSearch: validator(
      z.object({ attachmentId: z.optional(z.string()) }),
   ),
   beforeLoad: async (opts) => {
      const workspace = await opts.context.queryClient
         .ensureQueryData(
            trpc.workspace.one.queryOptions(
               { id: opts.params.workspaceId },
               { staleTime: CACHE_FOREVER },
            ),
         )
         .catch(() => {
            throw notFound()
         })

      if (!workspace) throw notFound()

      return {
         workspace,
      }
   },
   pendingComponent: () => (
      <>
         <Sidebar />
         <Main className="h-screen">
            <PendingComponent />
         </Main>
      </>
   ),
})

function RouteComponent() {
   const matches = useMatches()
   const isOnBoard = matches.some(
      (m) => m.routeId === "/_authed/$workspaceId/_layout/board",
   )

   return (
      <SocketProvider>
         {isOnBoard ? null : (
            <Sidebar className="md:motion-preset-fade">
               <SidebarContent />
            </Sidebar>
         )}
         <Main innerClassName="md:motion-preset-fade">
            <Outlet />
         </Main>
         <BottomNavigation />
      </SocketProvider>
   )
}
