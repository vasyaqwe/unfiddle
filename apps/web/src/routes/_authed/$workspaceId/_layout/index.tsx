import { useAuth } from "@/auth/hooks"
import { useEventListener } from "@/interactions/use-event-listener"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/")({
   component: RouteComponent,
})

const currentGreeting = () => {
   const hour = new Date().getHours()
   if (hour < 12) return "Добрий ранок"
   if (hour < 18) return "Добрий день"
   return "Добрий вечір"
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
            <HeaderTitle className="line-clamp-1">
               {auth.workspace.name}
            </HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <p className="mb-8 font-semibold text-xl max-md:hidden">
               {greeting}, {auth.user.name}
            </p>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
               <Card>
                  <CardHeader>
                     <CardTitle>Зароблено</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-3xl tracking-tight">
                        $49,482
                     </p>
                     <CardFooter>За сьогодні</CardFooter>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader>
                     <CardTitle>Зароблено</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-3xl tracking-tight">
                        $49,482
                     </p>
                     <CardFooter>За сьогодні</CardFooter>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader>
                     <CardTitle>Зароблено</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-3xl tracking-tight">
                        $49,482
                     </p>
                     <CardFooter>За сьогодні</CardFooter>
                  </CardContent>
               </Card>
            </div>
         </MainScrollArea>
      </>
   )
}
