import { CACHE_FOREVER } from "@/api"
import { Main } from "@/layout/components/main"
import { PendingComponent } from "@/layout/components/pending-component"
import { Sidebar } from "@/layout/components/sidebar"
import { BottomNavigation } from "@/routes/-components/bottom-navigation"
import { SidebarContent } from "@/routes/-components/sidebar"
import { trpc } from "@/trpc"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed")({
   component: RouteComponent,
   beforeLoad: async ({ context }) => {
      const user = await context.queryClient
         .ensureQueryData(
            trpc.user.me.queryOptions(undefined, {
               staleTime: CACHE_FOREVER,
               retry: false,
            }),
         )
         .catch(() => {
            throw redirect({ to: "/login" })
         })

      if (!user) throw redirect({ to: "/login" })
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
      <>
         <Sidebar className="motion-preset-fade">
            <SidebarContent />
         </Sidebar>
         <Main innerClassName="motion-preset-fade">
            <Outlet />
         </Main>
         <BottomNavigation />
      </>
   )
}
