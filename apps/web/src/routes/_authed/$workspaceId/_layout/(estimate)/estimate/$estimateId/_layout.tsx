import { ClientSeverityIcon } from "@/client/components/client-severity-icon"
import { useEstimate } from "@/estimate/hooks"
import { Header, HeaderBackButton } from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { ErrorComponent } from "@/ui/components/error"
import { SuspenseFallback } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { notFound } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout",
)({
   component: RouteComponent,
   loader: async (opts) => {
      const estimate = await opts.context.queryClient.ensureQueryData(
         opts.context.trpc.estimate.one.queryOptions(opts.params),
      )
      if (!estimate) throw notFound()
   },
   pendingComponent: () => {
      return (
         <>
            <Header>
               <HeaderBackButton />
            </Header>
            <SuspenseFallback />
         </>
      )
   },
   errorComponent: ({ error }) => {
      return (
         <>
            <Header>
               <HeaderBackButton />
            </Header>
            <MainScrollArea>
               <ErrorComponent error={error} />
            </MainScrollArea>
         </>
      )
   },
})

function RouteComponent() {
   const estimate = useEstimate()

   return (
      <div className="flex grow">
         <div className="relative flex grow flex-col">
            <Outlet />
         </div>
         <div
            className={
               "relative flex w-full shrink-0 grow flex-col border-neutral bg-surface-1 max-lg:hidden lg:max-w-60 lg:border-l xl:max-w-76"
            }
         >
            <ScrollArea className="px-5 pb-4">
               <div className="flex h-(--header-height) items-center gap-1">
                  <p className="text-muted">Деталі</p>
               </div>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Ціна</p>
                  <p className="mt-1.5 font-medium font-mono text-lg">
                     {estimate.sellingPrice
                        ? formatCurrency(estimate.sellingPrice, {
                             currency: estimate.currency,
                          })
                        : "—"}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Клієнт</p>
                  <p className="mt-1.5 flex items-center gap-2">
                     {estimate.client ? (
                        <>
                           <ClientSeverityIcon
                              className="-mb-0.5"
                              severity={estimate.client.severity}
                           />
                           {estimate.client.name}
                        </>
                     ) : (
                        "—"
                     )}
                  </p>
               </section>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Створене</p>
                  <p className="mt-2 flex items-center gap-2">
                     <Tooltip>
                        <TooltipTrigger
                           delay={0}
                           render={
                              <UserAvatar
                                 size={22}
                                 user={estimate.creator}
                              />
                           }
                        />
                        <TooltipPopup>{estimate.creator.name}</TooltipPopup>
                     </Tooltip>
                     {new Date(estimate.createdAt).getDate() ===
                     new Date().getDate()
                        ? `Сьогодні, ${formatDate(estimate.createdAt, {
                             timeStyle: "short",
                          })}`
                        : formatDate(estimate.createdAt, {
                             dateStyle: "short",
                             timeStyle: "short",
                          })}
                  </p>
               </section>
            </ScrollArea>
         </div>
      </div>
   )
}
