import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { trpc } from "@/trpc"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/migrate-clients",
)({
   component: RouteComponent,
})

function RouteComponent() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/migrate-clients",
   })
   const [result, setResult] = React.useState<{
      created: number
      updated: number
   } | null>(null)

   const migrateMutation = useMutation(
      trpc.workspace.migrateClients.mutationOptions({
         onSuccess: (data) => {
            setResult(data)
         },
      }),
   )

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle>Migrate Clients</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
            <div className="container mx-auto max-w-2xl py-8">
               <div className="space-y-6">
                  <div>
                     <h1 className="font-bold text-2xl">Client Migration</h1>
                     <p className="mt-2 text-muted-foreground">
                        This is a one-time migration to convert order client
                        text fields to structured client records.
                     </p>
                  </div>

                  <div className="rounded-lg border p-6">
                     <h2 className="mb-4 font-semibold text-lg">
                        What will this do?
                     </h2>
                     <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
                        <li>
                           Extract all unique client names from orders in this
                           workspace
                        </li>
                        <li>
                           Create client records with priority set to "low"
                        </li>
                        <li>
                           Link existing orders to the newly created clients
                        </li>
                        <li>Skip clients that already exist</li>
                     </ul>
                  </div>

                  <Button
                     onClick={() => migrateMutation.mutate(params)}
                     disabled={migrateMutation.isPending}
                     size="lg"
                  >
                     {migrateMutation.isPending && "loading.."}
                     Run Migration
                  </Button>

                  {migrateMutation.isError && (
                     <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                        <p className="font-semibold text-destructive text-sm">
                           Error occurred during migration
                        </p>
                        <p className="mt-1 text-destructive/80 text-sm">
                           {migrateMutation.error?.message ?? "Unknown error"}
                        </p>
                     </div>
                  )}

                  {result && (
                     <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
                        <p className="font-semibold text-green-700 text-sm dark:text-green-400">
                           Migration completed successfully!
                        </p>
                        <div className="mt-2 space-y-1 text-green-600 text-sm dark:text-green-300">
                           <p>• Created {result.created} new client records</p>
                           <p>
                              • Processed {result.updated} distinct client names
                           </p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </MainScrollArea>
      </>
   )
}
