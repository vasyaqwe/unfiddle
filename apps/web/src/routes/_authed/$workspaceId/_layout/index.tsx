import { useAuth } from "@/auth/hooks"
import { useEventListener } from "@/interactions/use-event-listener"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/")({
   component: RouteComponent,
})

const currentGreeting = () => {
   const hour = new Date().getHours()
   if (hour < 12) return "Morning"
   if (hour < 18) return "Afternoon"
   return "Evening"
}

function RouteComponent() {
   const auth = useAuth()
   const documentRef = React.useRef<Document>(document)

   const [greeting, setGreeting] = React.useState(currentGreeting())
   useEventListener(
      "visibilitychange",
      () => {
         if (document.visibilityState === "visible")
            setGreeting(currentGreeting())
      },
      documentRef,
   )

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle>{auth.workspace.name}</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <p className="font-semibold text-2xl">
               {greeting}, {auth.user.name}
            </p>
         </MainScrollArea>
      </>
   )
}
