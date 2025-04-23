import { useMountError } from "@/interactions/use-mount-error"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
   component: RouteComponent,
})

function RouteComponent() {
   useMountError("Login failed, please try again")

   return (
      <main className="grid h-svh w-full place-items-center bg-background">
         dasasd
      </main>
   )
}
