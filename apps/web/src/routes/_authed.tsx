import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { CACHE_FOREVER } from "@/api"
import { Main } from "@/layout/components/main"
import { PendingComponent } from "@/layout/components/pending-component"
import { Sidebar } from "@/layout/components/sidebar"
import { trpc } from "@/trpc"

export const Route = createFileRoute("/_authed")({
   component: RouteComponent,
   beforeLoad: async (opts) => {
      const user = await opts.context.queryClient
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

      return {
         user,
      }
   },
   pendingComponent: () => (
      <>
         <Sidebar />
         <Main className="h-screen">
            <PendingComponent animated />
         </Main>
      </>
   ),
})

function RouteComponent() {
   return <Outlet />
}
