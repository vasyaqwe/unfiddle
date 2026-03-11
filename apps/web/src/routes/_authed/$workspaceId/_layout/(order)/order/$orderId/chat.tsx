import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(order)/order/$orderId/chat",
)({
   component: RouteComponent,
})

function RouteComponent() {
   return (
      <div>
         Hello "/_authed/$workspaceId/_layout/(order)/order/$orderId/chat"!
      </div>
   )
}
