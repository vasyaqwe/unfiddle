import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/team")({
   component: RouteComponent,
})

function RouteComponent() {
   return <div>Hello "/_authed/people"!</div>
}
