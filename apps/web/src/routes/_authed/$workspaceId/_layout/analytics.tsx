import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/analytics")(
   {
      component: RouteComponent,
      loader: async ({ context, params }) => {
         context.queryClient.prefetchQuery(
            trpc.workspace.summary.queryOptions({
               id: params.workspaceId,
            }),
         )
      },
   },
)

function RouteComponent() {
   const params = Route.useParams()
   const summary = useQuery(
      trpc.workspace.summary.queryOptions({ id: params.workspaceId }),
   )

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
                        {formatNumber(summary.data?.weekProfit ?? 0)} ₴
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
                        {formatNumber(summary.data?.monthProfit ?? 0)} ₴
                     </p>
                     <CardFooter>За місяць</CardFooter>
                  </CardContent>
               </Card>
               <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader>
                     <CardTitle>Профіт</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                        {formatNumber(summary.data?.allTimeProfit ?? 0)} ₴
                     </p>
                     <CardFooter>За весь час</CardFooter>
                  </CardContent>
               </Card>
            </div>
         </MainScrollArea>
      </>
   )
}
