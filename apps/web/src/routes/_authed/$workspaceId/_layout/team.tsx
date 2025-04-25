import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/team")({
   component: RouteComponent,
})

function RouteComponent() {
   return <div>Hello "/_authed/$slug/_layout/team"!</div>
}
