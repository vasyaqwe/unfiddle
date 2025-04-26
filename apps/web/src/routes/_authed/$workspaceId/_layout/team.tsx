import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/team")({
   component: RouteComponent,
})

function RouteComponent() {
   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Команда</HeaderTitle>
         </Header>
         <MainScrollArea>
            <p className="font-semibold text-2xl">Команда</p>
         </MainScrollArea>
      </>
   )
}
