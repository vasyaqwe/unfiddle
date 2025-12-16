import { useAuth } from "@/auth/hooks"
import { ClientForm } from "@/client/components/client-form"
import { ClientSeverityIcon } from "@/client/components/client-severity-icon"
import { DeleteClientAlert } from "@/client/components/delete-client-alert"
import { UpdateClient } from "@/client/components/update-client"
import { useCreateClient } from "@/client/mutations/use-create-client"
import { useDeleteClient } from "@/client/mutations/use-delete-client"
import { useForceUpdate } from "@/interactions/use-force-update"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { VList, VListContent } from "@/layout/components/vlist"
import { trpc } from "@/trpc"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useVirtualizer } from "@tanstack/react-virtual"
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
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/clients")({
   component: RouteComponent,
   loader: async (opts) => {
      opts.context.queryClient.prefetchQuery(
         trpc.client.list.queryOptions({
            workspaceId: opts.params.workspaceId,
         }),
      )
   },
})

function RouteComponent() {
   const auth = useAuth()
   const [open, setOpen] = React.useState(false)
   const mutation = useCreateClient({
      onMutate: () => setOpen(false),
      onError: () => setOpen(true),
   })
   const scrollAreaRef = React.useRef<HTMLDivElement>(null)

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle className="line-clamp-1">Клієнти</HeaderTitle>
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
                        Клієнт
                     </Button>
                  }
               />
               <DrawerPopup>
                  <DrawerTitle>Новий клієнт</DrawerTitle>
                  <ClientForm
                     onSubmit={(form) => {
                        mutation.mutate({
                           ...form,
                           workspaceId: auth.workspace.id,
                        })
                     }}
                  >
                     <DrawerFooter>
                        <Button>Додати</Button>
                     </DrawerFooter>
                  </ClientForm>
               </DrawerPopup>
            </Drawer>
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

   const query = useSuspenseQuery(
      trpc.client.list.queryOptions({
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

   if (data.length === 0) return <ClientsEmpty />

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
               const client = query.data[row.index]
               if (!client) return null
               return (
                  <ClientRow
                     key={client.id}
                     client={client}
                  />
               )
            })}
         </VListContent>
      </VList>
   )
}

function ClientRow({
   client,
}: {
   client: RouterOutput["client"]["list"][number]
}) {
   const params = Route.useParams()
   const deleteItem = useDeleteClient()

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
               <ClientSeverityIcon
                  severity={client.severity}
                  className="mr-[2px] shrink-0"
               />
               <p className="col-span-2 col-start-1 row-start-2 mt-px line-clamp-1 break-normal font-semibold data-vat:text-orange-10">
                  {client.name}
               </p>
               <div
                  className="absolute"
                  onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                  }}
               >
                  <UpdateClient
                     open={updateOpen}
                     setOpen={setUpdateOpen}
                     clientId={client.id}
                     finalFocus={menuTriggerRef}
                  />
                  <DeleteClientAlert
                     open={deleteAlertOpen}
                     onOpenChange={setDeleteAlertOpen}
                     clientName={client.name}
                     finalFocus={menuTriggerRef}
                     action={() =>
                        deleteItem.mutate({
                           clientId: client.id,
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
            <ContextMenuItem
               destructive
               onClick={() => setDeleteAlertOpen(true)}
            >
               <Icons.trash />
               Видалити
            </ContextMenuItem>
         </ContextMenuPopup>
      </ContextMenu>
   )
}

export function ClientsEmpty() {
   const auth = useAuth()

   return (
      <div className="-translate-y-8 absolute inset-0 m-auto size-fit text-center">
         <div className="mx-auto mb-5 flex max-w-30 flex-col items-center">
            {auth.workspace.image ? (
               <img
                  src={auth.workspace.image}
                  alt=""
               />
            ) : (
               <Icons.empty />
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            Немає клієнтів
         </p>
      </div>
   )
}
