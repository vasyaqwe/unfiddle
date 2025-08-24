import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId",
)({
   component: RouteComponent,
})

function RouteComponent() {
   return (
      <div>
         Hello "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId"!
      </div>
   )
}
