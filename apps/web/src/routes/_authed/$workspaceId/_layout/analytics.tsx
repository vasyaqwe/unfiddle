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

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
   },
)

function RouteComponent() {
   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle>Аналітика</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
               <Card>
                  <CardHeader>
                     <CardTitle>Профіт</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                        $49,482
                     </p>
                     <CardFooter>За сьогодні</CardFooter>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader>
                     <CardTitle>Профіт</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                        $49,482
                     </p>
                     <CardFooter>За сьогодні</CardFooter>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader>
                     <CardTitle>Профіт</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
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
