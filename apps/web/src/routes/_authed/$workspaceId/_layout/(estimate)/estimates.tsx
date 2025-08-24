import { useAuth } from "@/auth/hooks"
import { DeleteEstimateAlert } from "@/estimate/components/delete-estimate-alert"
import { EstimateForm } from "@/estimate/components/estimate-form"
import { UpdateEstimate } from "@/estimate/components/update-estimate"
import { useCreateEstimate } from "@/estimate/mutations/use-create-estimate"
import { useDeleteEstimate } from "@/estimate/mutations/use-delete-estimate"
import { useForceUpdate } from "@/interactions/use-force-update"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { VList, VListContent } from "@/layout/components/vlist"
import { DateFilter } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/date-filter"
import { EstimatesEmpty } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/empty"
import { FilterMenu } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/filter-menu"
import { Search } from "@/routes/_authed/$workspaceId/_layout/(estimate)/-components/search"
import { trpc } from "@/trpc"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
import { estimateFilterSchema } from "@unfiddle/core/estimate/filter"
import { formatEstimateDate } from "@unfiddle/core/estimate/utils"
import { makeShortId } from "@unfiddle/core/id"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { Button } from "@unfiddle/ui/components/button"
import {
   Drawer,
   DrawerFooter,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import { MenuSeparator } from "@unfiddle/ui/components/menu"
import {
   ContextMenu,
   ContextMenuItem,
   ContextMenuPopup,
   ContextMenuTrigger,
} from "@unfiddle/ui/components/menu/context"
import { number } from "@unfiddle/ui/utils"
import * as React from "react"

export const Route = createFileRoute(
   "/_authed/$workspaceId/_layout/(estimate)/estimates",
)({
   component: RouteComponent,
   loaderDeps: (opts) => ({ search: opts.search }),
   loader: async (opts) => {
      opts.context.queryClient.prefetchQuery(
         trpc.estimate.list.queryOptions({
            workspaceId: opts.params.workspaceId,
            filter: opts.deps.search,
         }),
      )
   },
   validateSearch: validator(estimateFilterSchema),
})

function RouteComponent() {
   const auth = useAuth()
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateEstimate({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })
   const scrollAreaRef = React.useRef<HTMLDivElement>(null)

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle className="line-clamp-1">Прорахунок</HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea
            className="pt-0 lg:pt-0"
            container={false}
            ref={scrollAreaRef}
         >
            <Drawer
               open={open}
               onOpenChange={setOpen}
            >
               <DrawerTrigger
                  render={
                     <Button className="fixed right-3 bottom-[calc(var(--bottom-navigation-height)+0.75rem)] z-[10] overflow-visible shadow-xl md:right-8 md:bottom-8 md:h-9 md:px-3">
                        <Icons.plus className="md:size-6" />
                        Прорахунок
                     </Button>
                  }
               />
               <DrawerPopup>
                  <DrawerTitle>Новий прорахунок</DrawerTitle>
                  <EstimateForm
                     onSubmit={(form) =>
                        mutation.mutate({
                           ...form,
                           workspaceId: auth.workspace.id,
                           sellingPrice: number(form.sellingPrice),
                           client:
                              form.client.length === 0 ? null : form.client,
                        })
                     }
                  >
                     <DrawerFooter>
                        <Button>Додати</Button>
                     </DrawerFooter>
                  </EstimateForm>
               </DrawerPopup>
            </Drawer>

            <div className="sticky top-0 z-[5] flex min-h-12 items-center gap-1 border-surface-12/13 border-b bg-background px-1.5 shadow-xs/4 lg:min-h-10">
               <DateFilter />
               <FilterMenu />
               <Search />
            </div>
            <SuspenseBoundary>
               <Content scrollAreaRef={scrollAreaRef} />
            </SuspenseBoundary>
         </MainScrollArea>
      </>
   )
}

function Content({
   scrollAreaRef,
}: { scrollAreaRef: React.RefObject<HTMLDivElement | null> }) {
   "use no memo"
   const params = Route.useParams()
   const search = React.useDeferredValue(Route.useSearch())

   const query = useSuspenseQuery(
      trpc.estimate.list.queryOptions({
         filter: search,
         workspaceId: params.workspaceId,
      }),
   )
   const virtualizer = useVirtualizer({
      count: query.data.length,
      getScrollElement: () => scrollAreaRef.current,
      estimateSize: () => {
         return window.innerWidth < 1024 ? 72 : 44
      },
      overscan: 3,
   })
   const data = virtualizer.getVirtualItems()
   useForceUpdate()

   if (data.length === 0) return <EstimatesEmpty />

   return (
      <VList
         className="relative mb-20 w-full"
         totalSize={virtualizer.getTotalSize()}
      >
         <VListContent
            className="border-surface-5 border-b"
            start={data[0]?.start ?? 0}
         >
            {data.map((row) => {
               const estimate = query.data[row.index]
               if (!estimate) return null
               return (
                  <EstimateRow
                     key={estimate.id}
                     estimate={estimate}
                  />
               )
            })}
         </VListContent>
      </VList>
   )
}

function EstimateRow({
   estimate,
}: {
   estimate: RouterOutput["estimate"]["list"][number]
}) {
   const params = Route.useParams()
   const auth = useAuth()
   const deleteItem = useDeleteEstimate()

   const [updateOpen, setUpdateOpen] = React.useState(false)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLDivElement>(null)
   const [contextMenuOpen, setContextMenuOpen] = React.useState(false)

   return (
      <ContextMenu
         open={contextMenuOpen}
         onOpenChange={setContextMenuOpen}
      >
         <ContextMenuTrigger
            className={
               "border-surface-5 border-t transition-colors duration-[50ms] first:border-0 hover:bg-surface-1 data-active:bg-surface-2"
            }
            ref={menuTriggerRef}
            data-active={contextMenuOpen ? "" : undefined}
         >
            <div className="relative grid h-[72px] grid-cols-[1fr_auto] grid-rows-[1fr_auto] items-center gap-x-2.5 gap-y-2 px-2.5 py-2 text-left lg:flex lg:h-[44px]">
               <div className="flex items-center gap-2 max-lg:w-full">
                  <p className="whitespace-nowrap font-medium font-mono text-muted text-sm">
                     {makeShortId(estimate.shortId)}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium text-sm lg:w-[110px]">
                     <UserAvatar
                        size={25}
                        user={estimate.creator}
                        className="inline-block"
                     />
                     <span className="line-clamp-1">
                        {estimate.creator.name.split(" ")[0]}
                     </span>
                  </p>
               </div>
               <p className="col-span-2 col-start-1 row-start-2 mt-px line-clamp-1 break-normal font-semibold data-vat:text-orange-10">
                  {estimate.name}
               </p>
               <p className="ml-auto min-w-[60px] text-muted max-lg:hidden">
                  {formatEstimateDate(estimate.createdAt)}
               </p>
               <div
                  className="absolute"
                  onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                  }}
               >
                  <UpdateEstimate
                     open={updateOpen}
                     setOpen={setUpdateOpen}
                     estimate={estimate}
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
               </div>
            </div>
         </ContextMenuTrigger>
         <ContextMenuPopup>
            <ContextMenuItem
               onClick={() => {
                  setUpdateOpen(true)
               }}
            >
               <Icons.pencil />
               Редагувати
            </ContextMenuItem>
            <MenuSeparator />
            {auth.workspace.role === "owner" ||
            auth.workspace.role === "admin" ? (
               <ContextMenuItem
                  destructive
                  onClick={() => setDeleteAlertOpen(true)}
               >
                  <Icons.trash />
                  Видалити
               </ContextMenuItem>
            ) : null}
         </ContextMenuPopup>
      </ContextMenu>
   )
}
