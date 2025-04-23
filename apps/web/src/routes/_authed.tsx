import { CACHE_FOREVER } from "@/api"
import { trpc } from "@/trpc"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Logo } from "@unfiddle/ui/components/logo"
import { Shimmer } from "@unfiddle/ui/components/shimmer"

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
            <Logo className="size-7" />
            <Shimmer className="font-medium">Now unfiddleing..</Shimmer>
         </div>
      </main>
   ),
})

function RouteComponent() {
   return (
      <div className="flex grow flex-col pt-4 pb-14 md:pb-18 lg:pt-6">
         <p className="flex items-center gap-2.5 px-4 font-semibold text-lg lg:px-6">
            <Logo className="size-9 drop-shadow-md/8" />
            Unfiddle
         </p>
         <main className="flex grow flex-col">
            <Outlet />
         </main>
      </div>
   )
}
