import { CACHE_FOREVER } from "@/api"
import { Main } from "@/layout/components/main"
import { PendingComponent } from "@/layout/components/pending-component"
import { Sidebar } from "@/layout/components/sidebar"
import { BottomNavigation } from "@/routes/_authed/$workspaceId/-components/bottom-navigation"
import { SidebarContent } from "@/routes/_authed/$workspaceId/-components/sidebar"
import { SocketProvider } from "@/socket/provider"
import { trpc } from "@/trpc"
import {
   Outlet,
   createFileRoute,
   notFound,
   redirect,
} from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$workspaceId/_layout")({
   component: RouteComponent,
   beforeLoad: async ({ context, params }) => {
      const workspace = await context.queryClient
         .ensureQueryData(
            trpc.workspace.one.queryOptions(
               { id: params.workspaceId },
               { staleTime: CACHE_FOREVER },
            ),
         )
         .catch(() => {
            throw redirect({ to: "/login" })
         })

      if (!workspace) throw notFound()
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
   return (
      <SocketProvider>
         <Sidebar className="md:motion-preset-fade">
            <SidebarContent />
         </Sidebar>
         <Main innerClassName="md:motion-preset-fade">
            <Outlet />
         </Main>
         <BottomNavigation />
      </SocketProvider>
   )
}
