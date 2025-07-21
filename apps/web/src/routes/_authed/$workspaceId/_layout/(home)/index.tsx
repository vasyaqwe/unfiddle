import { useAuth } from "@/auth/hooks"
import { useTip } from "@/interactions/use-tip"
import { MainScrollArea } from "@/layout/components/main"
import { useCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { ArchiveOrderAlert } from "@/order/components/archive-order-alert"
import { CreateOrder } from "@/order/components/create-order"
import { DeleteOrderAlert } from "@/order/components/delete-order-alert"
import { SeverityIcon } from "@/order/components/severity-icon"
import { UpdateOrder } from "@/order/components/update-order"
import { useDeleteOrder } from "@/order/mutations/use-delete-order"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import { useOrderQueryOptions } from "@/order/queries"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { DateFilter } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/date-filter"
import { Empty } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/empty"
import { FilterMenu } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/filter-menu"
import { Search } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/search"
import { ToggleArchived } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/toggle-archived"
import { trpc } from "@/trpc"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { ORDER_STATUSES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_STATUSES } from "@unfiddle/core/order/constants"
import { orderFilterSchema } from "@unfiddle/core/order/filter"
import {
   formatOrderDate,
   makeShortId,
   orderStatusGradient,
} from "@unfiddle/core/order/utils"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@unfiddle/ui/components/avatar-stack"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Icons } from "@unfiddle/ui/components/icons"
import { MenuSeparator } from "@unfiddle/ui/components/menu"
import {
   ContextMenu,
   ContextMenuCheckboxItem,
   ContextMenuItem,
   ContextMenuPopup,
   ContextMenuTrigger,
} from "@unfiddle/ui/components/menu/context"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { atom, useAtom } from "jotai"
import { useTheme } from "next-themes"
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/(home)/")({
   component: RouteComponent,
   loaderDeps: (opts) => ({ search: opts.search }),
   loader: async (opts) => {
      opts.context.queryClient.prefetchQuery(
         trpc.order.list.queryOptions({
            workspaceId: opts.params.workspaceId,
            filter: opts.deps.search,
         }),
      )
   },
   validateSearch: validator(orderFilterSchema),
})

function RouteComponent() {
   const auth = useAuth()
   const scrollAreaRef = React.useRef<HTMLDivElement>(null)

   // if (auth.user.email !== "vasylpolishchuk22@gmail.com")
   // return (
   //    <div className="absolute inset-0 m-auto size-fit text-center">
   //       <h1>Технічна перерва</h1>
   //       <p>Сайт скоро повернеться</p>
   //    </div>
   // )

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle className="line-clamp-1">
               {auth.workspace.name}
            </HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea
            className="pt-0 lg:pt-0"
            container={false}
            ref={scrollAreaRef}
         >
            <CreateOrder>
               <DrawerTrigger
                  render={
                     <Button className="fixed right-3 bottom-[calc(var(--bottom-navigation-height)+0.75rem)] z-[10] overflow-visible shadow-xl md:right-8 md:bottom-8 md:h-9 md:px-3">
                        <Icons.plus className="md:size-6" />
                        Замовлення
                     </Button>
                  }
               />
            </CreateOrder>
            <div className="sticky top-0 z-[5] flex min-h-12 items-center gap-1 border-surface-12/13 border-b bg-background px-1.5 shadow-xs/4 lg:min-h-10">
               <ToggleArchived />
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
   scrollAreaRef: _,
}: { scrollAreaRef: React.RefObject<HTMLDivElement | null> }) {
   const queryOptions = useOrderQueryOptions()
   const query = useSuspenseQuery(queryOptions.list)
   useTip({
      key: "order_context_menu",
      message:
         "Клацніть на замовлення правою кнопкою миші, щоб відкрити менюшку",
      autoTrigger: true,
   })
   // const virtualizer = useVirtualizer({
   //    count: query.data.length,
   //    getScrollElement: () => scrollAreaRef.current,
   //    estimateSize: (_idx) => {
   //       return window.innerWidth < 1024 ? 90 : 43
   //    },
   // })
   // const data = virtualizer.getVirtualItems()
   // useForceUpdate()

   if (query.data.length === 0) return <Empty />

   return (
      <div className="relative mb-20 w-full">
         <div className="border-surface-5 border-b">
            {query.data.map((order) => {
               return (
                  <OrderRow
                     key={order.id}
                     order={order}
                  />
               )
            })}
         </div>
      </div>
   )
}

const lastContexedOrderIdAtom = atom<string | null>(null)

function _OrderRow({
   order,
}: {
   order: RouterOutput["order"]["list"][number]
}) {
   const params = Route.useParams()
   const auth = useAuth()
   const theme = useTheme()
   const [from, to] = orderStatusGradient(
      order.status ?? "canceled",
      theme.resolvedTheme ?? "light",
   )
   const update = useUpdateOrder()
   const deleteItem = useDeleteOrder()

   const [updateOpen, setUpdateOpen] = React.useState(false)
   const [archiveAlertOpen, setArchiveAlertOpen] = React.useState(false)
   const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLDivElement>(null)
   const [lastContexedOrderId, setLastContexedOrderId] = useAtom(
      lastContexedOrderIdAtom,
   )

   const totalProfit = order.procurements.reduce(
      (acc, p) =>
         acc + ((order.sellingPrice ?? 0) - p.purchasePrice) * p.quantity,
      0,
   )
   const assigned = order.assignees.some((a) => a.user.id === auth.user.id)
   const createAssignee = useCreateOrderAssignee()
   const deleteAssignee = useDeleteOrderAssignee()

   return (
      <ContextMenu
         onOpenChange={(open) => {
            if (open) return setLastContexedOrderId(order.id)
            setLastContexedOrderId(null)
         }}
      >
         <ContextMenuTrigger
            className={
               "border-surface-5 border-t transition-colors duration-[50ms] first:border-0 hover:bg-surface-1 data-active:bg-surface-2"
            }
            ref={menuTriggerRef}
            data-active={lastContexedOrderId === order.id ? "" : undefined}
         >
            <Link
               to="/$workspaceId/order/$orderId"
               params={{
                  workspaceId: params.workspaceId,
                  orderId: order.id,
               }}
               className="relative grid h-[71px] grid-cols-[1fr_auto] grid-rows-[1fr_auto] items-center gap-x-2.5 gap-y-1.5 px-2.5 py-2 text-left lg:flex lg:h-[44px]"
            >
               <div className="flex items-center gap-2 max-lg:w-full">
                  <SeverityIcon
                     severity={order.severity}
                     className="mr-[2px] shrink-0"
                  />
                  <p className="whitespace-nowrap font-medium font-mono text-foreground/75 text-sm">
                     {makeShortId(order.shortId)}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium text-sm lg:w-[108px]">
                     <UserAvatar
                        size={25}
                        user={order.creator}
                        className="inline-block"
                     />
                     <span className="line-clamp-1">{order.creator.name}</span>
                  </p>
               </div>
               <p
                  data-vat={order.vat ? "" : undefined}
                  className="lg:!max-w-[80%] col-span-2 col-start-1 row-start-2 mt-px w-[calc(100%-36px)] break-normal font-semibold data-vat:text-orange-10"
               >
                  {order.name}
               </p>
               <div className="ml-auto flex items-center gap-4">
                  <AvatarStack className="max-md:hidden">
                     {order.assignees.map((assignee) => (
                        <AvatarStackItem key={assignee.user.id}>
                           <Tooltip delay={0}>
                              <TooltipTrigger
                                 render={
                                    <UserAvatar
                                       size={25}
                                       user={assignee.user}
                                    />
                                 }
                              />
                              <TooltipPopup>{assignee.user.name}</TooltipPopup>
                           </Tooltip>
                        </AvatarStackItem>
                     ))}
                  </AvatarStack>
                  {order.status &&
                  order.status !== "pending" &&
                  ORDER_STATUSES_TRANSLATION[order.status] ? (
                     <Combobox
                        canBeEmpty
                        value={order.status}
                        onValueChange={(status) => {
                           if (order.status === status)
                              return update.mutate({
                                 id: order.id,
                                 workspaceId: params.workspaceId,
                                 status: "pending",
                              })

                           update.mutate({
                              id: order.id,
                              workspaceId: params.workspaceId,
                              status: status as never,
                           })
                        }}
                     >
                        <ComboboxTrigger
                           onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                           }}
                           className={"cursor-pointer"}
                        >
                           <Badge
                              style={{
                                 background: `linear-gradient(140deg, ${from}, ${to})`,
                              }}
                           >
                              {ORDER_STATUSES_TRANSLATION[order.status] ??
                                 "Без статусу"}{" "}
                              {order.status === "successful"
                                 ? `(${formatCurrency(totalProfit, {
                                      currency: order.currency,
                                   })})`
                                 : ""}
                           </Badge>
                        </ComboboxTrigger>
                        <ComboboxPopup
                           sideOffset={4}
                           align="end"
                           onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                           }}
                        >
                           <ComboboxInput />
                           {ORDER_STATUSES.map((s) =>
                              s === "pending" ? null : (
                                 <ComboboxItem
                                    key={s}
                                    value={s}
                                    keywords={[ORDER_STATUSES_TRANSLATION[s]]}
                                 >
                                    {ORDER_STATUSES_TRANSLATION[s]}
                                 </ComboboxItem>
                              ),
                           )}
                        </ComboboxPopup>
                     </Combobox>
                  ) : null}
               </div>
               <p className="min-w-[60px] text-foreground/75 max-lg:hidden">
                  {formatOrderDate(order.createdAt)}
               </p>
               <div
                  className="absolute"
                  onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                  }}
               >
                  <UpdateOrder
                     open={updateOpen}
                     setOpen={setUpdateOpen}
                     order={order}
                     finalFocus={menuTriggerRef}
                  />
                  <ArchiveOrderAlert
                     open={archiveAlertOpen}
                     onOpenChange={setArchiveAlertOpen}
                     orderName={order.name}
                     finalFocus={menuTriggerRef}
                     action={() =>
                        update.mutate({
                           id: order.id,
                           workspaceId: params.workspaceId,
                           deletedAt: new Date(),
                        })
                     }
                  />
                  <DeleteOrderAlert
                     open={deleteAlertOpen}
                     onOpenChange={setDeleteAlertOpen}
                     orderName={order.name}
                     finalFocus={menuTriggerRef}
                     action={() =>
                        deleteItem.mutate({
                           orderId: order.id,
                           workspaceId: params.workspaceId,
                        })
                     }
                  />
               </div>
            </Link>
         </ContextMenuTrigger>
         <ContextMenuPopup>
            <ContextMenuCheckboxItem
               closeOnClick
               onClick={() => {
                  if (assigned)
                     return deleteAssignee.mutate({
                        orderId: order.id,
                        userId: auth.user.id,
                        workspaceId: auth.workspace.id,
                     })

                  createAssignee.mutate({
                     orderId: order.id,
                     userId: auth.user.id,
                     workspaceId: auth.workspace.id,
                  })
               }}
            >
               {assigned ? (
                  <>
                     <Icons.undo className="size-[18px]" />
                     Залишити
                  </>
               ) : (
                  <>
                     <Icons.pin className="size-5" />
                     Зайняти
                  </>
               )}
            </ContextMenuCheckboxItem>
            <ContextMenuItem
               onClick={() => {
                  setUpdateOpen(true)
               }}
            >
               <Icons.pencil />
               Редагувати
            </ContextMenuItem>
            <MenuSeparator />
            {order.deletedAt === null ? (
               <ContextMenuItem
                  destructive
                  onClick={() => setArchiveAlertOpen(true)}
               >
                  <Icons.archive />
                  Архівувати
               </ContextMenuItem>
            ) : (
               <ContextMenuItem
                  onClick={() =>
                     update.mutate({
                        id: order.id,
                        workspaceId: params.workspaceId,
                        deletedAt: null,
                     })
                  }
               >
                  <Icons.undo />
                  Відновити
               </ContextMenuItem>
            )}
            {order.deletedAt &&
            (auth.workspace.role === "owner" ||
               auth.workspace.role === "admin") ? (
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

const OrderRow = React.memo(_OrderRow)
