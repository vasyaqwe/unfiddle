import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/settings")({
   component: RouteComponent,
})

function RouteComponent() {
   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Налаштування</HeaderTitle>
         </Header>
         <MainScrollArea
            container={false}
            className="pt-4 lg:pt-8"
         >
            <div className="container mb-8 flex items-center justify-between max-md:hidden">
               <p className="font-semibold text-xl">Налаштування</p>
            </div>
         </MainScrollArea>
      </>
   )
}
