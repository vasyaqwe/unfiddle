import { CACHE_FOREVER } from "@/api"
import { BottomNavigation } from "@/routes/-components/bottom-navigation"
import { Sidebar } from "@/routes/-components/sidebar"
import { trpc } from "@/trpc"
import { Logo } from "@ledgerblocks/ui/components/logo"
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
      <main>
         <div className="absolute inset-0 m-auto flex size-fit items-center gap-2.5">
            <Logo className="size-6" />
            <p
               className="font-medium text-foreground/75 text-lg"
               data-loading-ellipsis
            >
               ledgerblocks
            </p>
         </div>
      </main>
   ),
})

function RouteComponent() {
   return (
      <>
         <Sidebar />
         <main
            className={
               "flex h-[calc(100svh-var(--bottom-navigation-height))] md:h-svh md:grow"
            }
         >
            <div className={"relative flex grow flex-col"}>
               <Outlet />
            </div>
         </main>
         <BottomNavigation />
      </>
   )
}
