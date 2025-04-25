import { trpc } from "@/trpc"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/")({
   component: () => null,
   beforeLoad: async ({ context }) => {
      const memberships = await context.queryClient
         .ensureQueryData(trpc.workspace.memberships.queryOptions())
         .catch(() => {
            throw redirect({ to: "/login" })
         })

      const workspaceId = memberships?.[0]?.workspace.id
      if (!workspaceId) throw redirect({ to: "/new" })

      throw redirect({ to: "/$workspaceId", params: { workspaceId } })
   },
})
