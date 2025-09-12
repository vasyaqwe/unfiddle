import { useAuth } from "@/auth/hooks"
import { DeleteEstimateAlert } from "@/estimate/components/delete-estimate-alert"
import { UpdateEstimate } from "@/estimate/components/update-estimate"
import { useEstimate } from "@/estimate/hooks"
import { CreateEstimateItem } from "@/estimate/item/components/create-estimate-item"
import { useDeleteEstimate } from "@/estimate/mutations/use-delete-estimate"
import { useUpdateEstimate } from "@/estimate/mutations/use-update-estimate"
import { CreateEstimateProcurement } from "@/estimate/procurement/components/create-estimate-procurement"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { EstimateItem } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/estimate-item"
import { EstimateProcurement } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/estimate-procurement"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import {
   SuspenseBoundary,
   SuspenseFallback,
} from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatEstimateDate } from "@unfiddle/core/estimate/utils"
import { makeShortId } from "@unfiddle/core/id"
import { Button } from "@unfiddle/ui/components/button"
import { Card } from "@unfiddle/ui/components/card"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import { ScrollArea } from "@unfiddle/ui/components/scroll-area"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId",
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
         <div className="flex grow flex-col">
            <Header className="md:flex">
               <HeaderBackButton />
               <HeaderTitle className="line-clamp-1">
                  <span className="md:hidden">Прорахунок</span>{" "}
                  {makeShortId(estimate.shortId)}
               </HeaderTitle>
               <Actions />
            </Header>
            <MainScrollArea>
               <p className="mt-2 mb-3 font-semibold text-xl md:text-2xl">
                  {estimate.name}
               </p>
               <p className="mb-1 whitespace-pre-wrap">{estimate.note}</p>
               <div className="mb-6 grid grid-cols-[40%_1fr] gap-y-4 lg:hidden">
                  <section className="group/section">
                     <p className="text-muted text-sm">Ціна</p>
                     <p className="mt-1.5 font-medium font-mono text-lg">
                        {estimate.sellingPrice
                           ? formatCurrency(estimate.sellingPrice, {
                                currency: estimate.currency,
                             })
                           : "—"}
                     </p>
                  </section>
                  <section className="group/section">
                     <p className="text-muted text-sm">Клієнт</p>
                     <p className="mt-1.5">{estimate.client ?? "—"}</p>
                  </section>
                  <section className="group/section">
                     <p className="text-muted text-sm">Створене</p>
                     <p className="mt-2 flex items-center gap-2">
                        <UserAvatar
                           size={22}
                           user={estimate.creator}
                        />
                        {estimate.creator.name} —{" "}
                        {new Date(estimate.createdAt).getDate() ===
                        new Date().getDate() ? (
                           <span className="max-md:hidden">Сьогодні о</span>
                        ) : null}
                        {formatEstimateDate(estimate.createdAt)}
                     </p>
                  </section>
               </div>
               <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                     <p className="font-medium text-lg">Товари</p>
                     <CreateEstimateItem>
                        <DrawerTrigger
                           render={
                              <Button variant={"secondary"}>
                                 <Icons.plus className="md:size-6" />
                                 Додати
                              </Button>
                           }
                        />
                     </CreateEstimateItem>
                  </div>
                  <div className="relative">
                     {estimate.items.map((item) => (
                        <EstimateItem
                           key={item.id}
                           item={item}
                        />
                     ))}
                  </div>
               </div>
               <div className="relative mt-5 min-h-[250px]">
                  <div className="my-2 flex items-center justify-between">
                     <p className="font-medium text-lg">Закупівлі</p>
                     <CreateEstimateProcurement />
                  </div>
                  <SuspenseBoundary>
                     <Procurements />
                  </SuspenseBoundary>
               </div>
            </MainScrollArea>
         </div>
         <div
            className={
               "relative flex w-full shrink-0 grow flex-col border-neutral bg-surface-1 max-lg:hidden lg:max-w-[15rem] lg:border-l xl:max-w-[19rem]"
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
                  <p className="mt-1.5">{estimate.client ?? "—"}</p>
               </section>
               <section className="group/section py-3">
                  <p className="text-muted text-sm">Створене</p>
                  <p className="mt-2 flex items-center gap-2">
                     <Tooltip delay={0}>
                        <TooltipTrigger
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
                        ? "Сьогодні о "
                        : ""}
                     {formatEstimateDate(estimate.createdAt)}
                  </p>
               </section>
            </ScrollArea>
         </div>
      </div>
   )
}

function Actions() {
   const params = Route.useParams()
   const auth = useAuth()
   const estimate = useEstimate()
   const _update = useUpdateEstimate()
   const deleteItem = useDeleteEstimate()

   const [editOpen, setEditOpen] = React.useState(false)
   const [_archiveAlertOpen, _setArchiveAlertOpen] = React.useState(false)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="md:ml-2"
                  >
                     <Icons.ellipsisHorizontal />
                  </Button>
               }
            />
            <MenuPopup align="start">
               <MenuItem
                  onClick={() => {
                     setEditOpen(true)
                  }}
               >
                  <Icons.pencil />
                  Редагувати
               </MenuItem>
               {auth.workspace.role === "owner" ||
               auth.workspace.role === "admin" ? (
                  <MenuItem
                     destructive
                     onClick={() => setDeleteAlertOpen(true)}
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               ) : null}
            </MenuPopup>
         </Menu>
         <UpdateEstimate
            open={editOpen}
            setOpen={setEditOpen}
            estimateId={estimate.id}
            finalFocus={menuTriggerRef}
         />
         <DeleteEstimateAlert
            open={deleteAlertOpen}
            onOpenChange={setDeleteAlertOpen}
            estimateName={estimate.name}
            finalFocus={menuTriggerRef}
            action={() =>
               deleteItem.mutate({
                  estimateId: estimate.id,
                  workspaceId: params.workspaceId,
               })
            }
         />
      </>
   )
}

function Procurements() {
   const params = Route.useParams()
   const query = useSuspenseQuery(
      trpc.estimateProcurement.list.queryOptions(params),
   )

   if (query.data.length === 0)
      return <p className="font-medium text-muted">Ще немає закупівель.</p>

   return (
      <Card className="relative mt-2 p-0">
         {query.data.map((p) => (
            <EstimateProcurement
               key={p.id}
               procurement={p}
            />
         ))}
      </Card>
   )
}
