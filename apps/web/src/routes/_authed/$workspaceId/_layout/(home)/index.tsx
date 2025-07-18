import { useAuth } from "@/auth/hooks"
import { MainScrollArea } from "@/layout/components/main"
import { useCreateOrderAssignee } from "@/order/assignee/mutations/use-create-order-assignee"
import { useDeleteOrderAssignee } from "@/order/assignee/mutations/use-delete-order-assignee"
import { CreateOrder } from "@/order/components/create-order"
import { SeverityIcon } from "@/order/components/severity-icon"
import { UpdateOrder } from "@/order/components/update-order"
import { CreateOrderItem } from "@/order/item/components/create-order-item"
import { UpdateOrderItem } from "@/order/item/components/update-order-item"
import { useDeleteOrderItem } from "@/order/item/mutations/use-delete-order-item"
import { useDeleteOrder } from "@/order/mutations/use-delete-order"
import { useUpdateOrder } from "@/order/mutations/use-update-order"
import { useOrderQueryOptions } from "@/order/queries"
import { expandedOrderIdsAtom } from "@/order/store"
import { CreateProcurement } from "@/procurement/components/create-procurement"
import { UpdateProcurement } from "@/procurement/components/update-procurement"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
import { useDeleteProcurement } from "@/procurement/mutations/use-delete-procurement"
import { useUpdateProcurement } from "@/procurement/mutations/use-update-procurement"
import { procurementStatusGradient } from "@/procurement/utils"
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
import { ToggleAll } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/toggle-all"
import { ToggleArchived } from "@/routes/_authed/$workspaceId/_layout/(home)/-components/toggle-archived"
import { trpc } from "@/trpc"
import { AlignedColumn } from "@/ui/components/aligned-column"
import { SuspenseBoundary } from "@/ui/components/suspense-boundary"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { Toggle } from "@base-ui-components/react/toggle"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { formatNumber } from "@unfiddle/core/number"
import { ORDER_STATUSES_TRANSLATION } from "@unfiddle/core/order/constants"
import { ORDER_STATUSES } from "@unfiddle/core/order/constants"
import { orderFilterSchema } from "@unfiddle/core/order/filter"
import type { OrderItem as OrderItemType } from "@unfiddle/core/order/item/types"
import {
   formatOrderDate,
   orderStatusGradient,
} from "@unfiddle/core/order/utils"
import { PROCUREMENT_STATUSES } from "@unfiddle/core/procurement/constants"
import type { Procurement } from "@unfiddle/core/procurement/types"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@unfiddle/ui/components/avatar-stack"
import { Badge } from "@unfiddle/ui/components/badge"
import { Button } from "@unfiddle/ui/components/button"
import { Card } from "@unfiddle/ui/components/card"
import {
   Collapsible,
   CollapsiblePanel,
   CollapsibleTrigger,
   CollapsibleTriggerIcon,
} from "@unfiddle/ui/components/collapsible"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@unfiddle/ui/components/combobox"
import {
   AlertDialog,
   AlertDialogClose,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogPopup,
   AlertDialogTitle,
} from "@unfiddle/ui/components/dialog/alert"
import { DrawerTrigger } from "@unfiddle/ui/components/drawer"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import {
   Popover,
   PopoverPopup,
   PopoverTrigger,
} from "@unfiddle/ui/components/popover"
import { Separator } from "@unfiddle/ui/components/separator"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@unfiddle/ui/components/table"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@unfiddle/ui/components/tooltip"
import { cx, formData } from "@unfiddle/ui/utils"
import { useAtom } from "jotai"
import { useTheme } from "next-themes"
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/(home)/")({
   component: RouteComponent,
   loaderDeps: (opts) => ({ search: opts.search }),
   loader: async ({ context, params, deps }) => {
      context.queryClient.prefetchQuery(
         trpc.order.list.queryOptions({
            workspaceId: params.workspaceId,
            filter: deps.search,
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
               <ToggleAll />
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
         <div className="divide-y divide-surface-5 border-surface-5 border-b">
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

function _OrderRow({
   order,
}: {
   order: RouterOutput["order"]["list"][number]
}) {
   const params = Route.useParams()
   const auth = useAuth()
   const theme = useTheme()
   const [expandedOrderIds, setExpandedOrderIds] = useAtom(expandedOrderIdsAtom)
   const [from, to] = orderStatusGradient(
      order.status ?? "canceled",
      theme.resolvedTheme ?? "light",
   )
   const update = useUpdateOrder()
   const deleteItem = useDeleteOrder()
   const createAssignee = useCreateOrderAssignee()
   const deleteAssignee = useDeleteOrderAssignee()

   const [editOpen, setEditOpen] = React.useState(false)
   const [confirmArchiveOpen, setConfirmArchiveOpen] = React.useState(false)
   const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const totalProfit = order.procurements.reduce(
      (acc, p) =>
         acc + ((order.sellingPrice ?? 0) - p.purchasePrice) * p.quantity,
      0,
   )

   return (
      <Collapsible
         open={expandedOrderIds.includes(order.id)}
         onOpenChange={(open) =>
            setExpandedOrderIds(
               open
                  ? [...expandedOrderIds, order.id]
                  : expandedOrderIds.filter((id) => id !== order.id),
            )
         }
      >
         <CollapsibleTrigger
            render={<div />}
            className="relative grid grid-cols-2 grid-rows-[1fr_auto] gap-x-2.5 gap-y-1.5 py-2 pr-1.5 pl-2.5 text-left transition-colors duration-50 first:border-none hover:bg-surface-1 has-data-[popup-open]:bg-surface-1 aria-expanded:bg-surface-1 lg:flex lg:py-[0.4rem]"
         >
            <div className="flex items-center gap-2">
               <CollapsibleTriggerIcon className="lg:mr-0.5 lg:mb-px" />
               <SeverityIcon
                  severity={order.severity}
                  className="mr-[2px] shrink-0"
               />
               <p className="whitespace-nowrap font-medium font-mono text-foreground/75 text-sm">
                  №{String(order.shortId).padStart(3, "0")}
               </p>
               <AlignedColumn
                  id={`o_creator`}
                  className="flex items-center gap-1.5 whitespace-nowrap font-medium text-sm"
               >
                  <UserAvatar
                     size={25}
                     user={order.creator}
                     className="inline-block"
                  />
                  <span className="whitespace-nowrap">
                     {order.creator.name}
                  </span>
               </AlignedColumn>
            </div>
            <p
               data-vat={order.vat ? "" : undefined}
               className="lg:!max-w-[80%] col-span-2 col-start-1 row-start-2 mt-px w-[calc(100%-36px)] break-normal font-semibold data-vat:text-orange-10 max-lg:pl-1"
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
                              ? `(${formatCurrency(totalProfit)})`
                              : ""}
                        </Badge>
                     </ComboboxTrigger>
                     <ComboboxPopup
                        sideOffset={4}
                        align="end"
                        onClick={(e) => {
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
               onClick={(e) => e.stopPropagation()}
            >
               <UpdateOrder
                  open={editOpen}
                  setOpen={setEditOpen}
                  order={order}
                  finalFocus={menuTriggerRef}
               />
               <AlertDialog
                  open={confirmArchiveOpen}
                  onOpenChange={setConfirmArchiveOpen}
               >
                  <AlertDialogPopup
                     finalFocus={menuTriggerRef}
                     onClick={(e) => e.stopPropagation()}
                  >
                     <AlertDialogTitle>
                        Архівувати {order.name}?
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        Замовлення не буде повністю видалене, лише{" "}
                        <br className="max-sm:hidden" /> переміщене в
                        архівовані.
                     </AlertDialogDescription>
                     <AlertDialogFooter>
                        <AlertDialogClose
                           render={
                              <Button variant="secondary">Відмінити</Button>
                           }
                        />
                        <AlertDialogClose
                           render={
                              <Button
                                 variant={"destructive"}
                                 onClick={() =>
                                    update.mutate({
                                       id: order.id,
                                       workspaceId: params.workspaceId,
                                       deletedAt: new Date(),
                                    })
                                 }
                              >
                                 Архівувати
                              </Button>
                           }
                        />
                     </AlertDialogFooter>
                  </AlertDialogPopup>
               </AlertDialog>
               <AlertDialog
                  open={confirmDeleteOpen}
                  onOpenChange={setConfirmDeleteOpen}
               >
                  <AlertDialogPopup
                     finalFocus={menuTriggerRef}
                     onClick={(e) => e.stopPropagation()}
                  >
                     <AlertDialogTitle>
                        Видалити {order.name}?,{" "}
                     </AlertDialogTitle>
                     <AlertDialogDescription>
                        Замовлення буде видалене назавжди, разом{" "}
                        <br className="max-sm:hidden" /> із всіми його
                        закупівлями.
                     </AlertDialogDescription>
                     <AlertDialogFooter>
                        <AlertDialogClose
                           render={
                              <Button variant="secondary">Відмінити</Button>
                           }
                        />
                        <AlertDialogClose
                           render={
                              <Button
                                 variant={"destructive"}
                                 onClick={() =>
                                    deleteItem.mutate({
                                       id: order.id,
                                       workspaceId: params.workspaceId,
                                    })
                                 }
                              >
                                 Видалити
                              </Button>
                           }
                        />
                     </AlertDialogFooter>
                  </AlertDialogPopup>
               </AlertDialog>
            </div>
            <Menu>
               <MenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  ref={menuTriggerRef}
                  render={
                     <Button
                        variant={"ghost"}
                        kind={"icon"}
                        className="col-start-2 row-start-2 shrink-0 justify-self-end max-lg:self-end"
                     >
                        <Icons.ellipsisHorizontal />
                     </Button>
                  }
               />
               <MenuPopup
                  align="end"
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <MenuItem
                     onClick={() => {
                        setEditOpen(true)
                     }}
                  >
                     <Icons.pencil />
                     Редагувати
                  </MenuItem>
                  {order.deletedAt === null ? (
                     <MenuItem
                        destructive
                        onClick={() => setConfirmArchiveOpen(true)}
                     >
                        <Icons.archive />
                        Архівувати
                     </MenuItem>
                  ) : (
                     <MenuItem
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
                     </MenuItem>
                  )}
                  {order.deletedAt &&
                  (auth.workspace.role === "owner" ||
                     auth.workspace.role === "admin") ? (
                     <MenuItem
                        destructive
                        onClick={() => setConfirmDeleteOpen(true)}
                     >
                        <Icons.trash />
                        Видалити
                     </MenuItem>
                  ) : null}
               </MenuPopup>
            </Menu>
         </CollapsibleTrigger>
         <CollapsiblePanel
            key={`${order.procurements.length}_${!!order.note}_${order.analogs.length}_${order.items.length}`}
            render={
               <div className="border-neutral border-t bg-surface-3/60 pt-2">
                  <div className="container mb-4">
                     <div className="mt-1 mb-2 flex items-center gap-2">
                        <Toggle
                           pressed={order.assignees.some(
                              (a) => a.user.id === auth.user.id,
                           )}
                           render={(props, state) => (
                              <Button
                                 {...props}
                                 className="max-sm:grow"
                                 variant={"secondary"}
                                 onClick={() => {
                                    if (state.pressed)
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
                                 {state.pressed ? (
                                    <>
                                       <Icons.undo className="!-ml-0.5 mr-px size-[18px]" />
                                       Залишити
                                    </>
                                 ) : (
                                    <>
                                       <Icons.pin className="size-5" />
                                       Зайняти
                                    </>
                                 )}
                              </Button>
                           )}
                        />
                        {order.analogs.length === 0 ? (
                           <CreateAnalog
                              orderId={order.id}
                              analogs={order.analogs}
                           />
                        ) : null}
                     </div>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="first:pl-0 last:pr-0">
                                 Ціна
                              </TableHead>
                              <TableHead className="first:pl-0 last:pr-0">
                                 Термін постачання
                              </TableHead>
                              <TableHead className="first:pl-0 last:pr-0">
                                 Клієнт
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           <TableRow className="border-surface-4 font-medium">
                              <TableCell className="font-mono first:pl-0 last:pr-0">
                                 {order.sellingPrice
                                    ? formatCurrency(order.sellingPrice)
                                    : "—"}
                              </TableCell>
                              <TableCell className="first:pl-0 last:pr-0">
                                 {order.deliversAt
                                    ? formatDate(order.deliversAt)
                                    : "—"}
                              </TableCell>
                              <TableCell className="first:pl-0 last:pr-0">
                                 {order.client ?? "—"}
                              </TableCell>
                           </TableRow>
                        </TableBody>
                     </Table>
                     <p
                        className={cx(
                           "mt-2 mb-3 flex gap-1 whitespace-pre-wrap font-medium",
                           order.note.length === 0 ? "hidden" : "",
                        )}
                     >
                        {order.note}
                     </p>
                     <div>
                        <div className="mb-2 flex items-center justify-between">
                           <p className="font-medium text-lg">Товари</p>
                           <CreateOrderItem
                              orderId={order.id}
                              orderName={order.name}
                           >
                              <DrawerTrigger
                                 render={
                                    <Button variant={"secondary"}>
                                       <Icons.plus className="md:size-6" />
                                       Додати
                                    </Button>
                                 }
                              />
                           </CreateOrderItem>
                        </div>
                        <div className="relative z-[2] mt-2">
                           {order.items.map((item) => (
                              <OrderItem
                                 key={item.id}
                                 item={item}
                                 orderId={order.id}
                                 ordersLength={order.items.length}
                                 orderName={order.name}
                              />
                           ))}
                        </div>
                     </div>
                     {order.analogs.length === 0 ? null : (
                        <div>
                           <div className="my-2 flex items-center justify-between">
                              <p className="font-medium text-lg">Аналоги</p>
                              <CreateAnalog
                                 orderId={order.id}
                                 analogs={order.analogs}
                              />
                           </div>
                           <div className="mb-4 flex flex-wrap gap-1">
                              {order.analogs.map((name, idx) => (
                                 <Card
                                    key={name}
                                    className="group/analog before:mask-l-from-[2rem] relative flex items-center rounded-md border-surface-12/15 px-3 py-1.5 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-background before:opacity-0 before:transition-opacity hover:before:opacity-100"
                                 >
                                    {name}
                                    <Button
                                       className="absolute right-0.75 z-[2] opacity-0 transition-opacity group-hover/analog:opacity-100"
                                       size={"sm"}
                                       kind={"icon"}
                                       variant={"ghost"}
                                       onClick={(e) => {
                                          e.stopPropagation()
                                          update.mutate({
                                             id: order.id,
                                             workspaceId: params.workspaceId,
                                             analogs: order.analogs.filter(
                                                (_, existingIdx) =>
                                                   existingIdx !== idx,
                                             ),
                                          })
                                       }}
                                    >
                                       <Icons.trash className="size-4" />
                                    </Button>
                                 </Card>
                              ))}
                           </div>
                        </div>
                     )}
                     <div className="my-2 flex items-center justify-between">
                        <p className="font-medium text-lg">Закупівлі</p>
                        <CreateProcurement
                           orderItems={order.items}
                           orderName={order.name}
                           orderId={order.id}
                           empty={order.procurements.length === 0}
                        />
                     </div>
                     {order.procurements.length === 0 ? (
                        <p className="font-medium text-foreground/75">
                           Ще немає закупівель.
                        </p>
                     ) : (
                        <Card className="relative z-[2] mt-2 rounded-lg border-surface-12/15 p-0">
                           {order.procurements.map((p) => (
                              <ProcurementRow
                                 key={p.id}
                                 item={p}
                                 sellingPrice={order.sellingPrice ?? 0}
                                 orderId={order.id}
                                 orderName={order.name}
                                 orderItems={order.items}
                              />
                           ))}
                        </Card>
                     )}
                  </div>
               </div>
            }
         />
      </Collapsible>
   )
}

const OrderRow = React.memo(_OrderRow)

function OrderItem({
   item,
   orderId,
   ordersLength,
   orderName,
}: {
   item: OrderItemType
   orderId: string
   ordersLength: number
   orderName: string
}) {
   const params = Route.useParams()
   const [editOpen, setEditOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const deleteItem = useDeleteOrderItem()

   return (
      <Card className="mt-1 items-center border-surface-12/15 p-3 text-left lg:flex lg:gap-2 lg:p-2 lg:pl-3">
         <span className="line-clamp-1 font-medium max-lg:w-[calc(100%-2rem)]">
            {" "}
            {item.name}
         </span>
         <Separator className="w-full max-lg:my-2 lg:mx-1 lg:h-4 lg:w-px" />
         <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-mono"> {item.quantity} шт.</span>
            {item.desiredPrice ? (
               <>
                  <Separator className="mx-1 h-4 w-px" />
                  <span className="font-mono">
                     Бажано по {formatCurrency(item.desiredPrice)}
                  </span>
               </>
            ) : null}
         </span>
         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateOrderItem
               orderId={orderId}
               orderItem={item}
               orderName={orderName}
               open={editOpen}
               setOpen={setEditOpen}
               finalFocus={menuTriggerRef}
            />
         </div>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="shrink-0 justify-self-end max-lg:absolute max-lg:top-1 max-lg:right-1 lg:ml-auto"
                  >
                     <Icons.ellipsisHorizontal />
                  </Button>
               }
            />
            <MenuPopup
               align="end"
               onClick={(e) => {
                  e.stopPropagation()
               }}
            >
               <MenuItem
                  onClick={() => {
                     setEditOpen(true)
                  }}
               >
                  <Icons.pencil />
                  Редагувати
               </MenuItem>
               {ordersLength === 1 ? null : (
                  <MenuItem
                     destructive
                     onClick={() =>
                        deleteItem.mutate({
                           workspaceId: params.workspaceId,
                           orderId,
                           orderItemId: item.id,
                        })
                     }
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               )}
            </MenuPopup>
         </Menu>
      </Card>
   )
}

function CreateAnalog({
   orderId,
   analogs,
}: { orderId: string; analogs: string[] }) {
   const params = Route.useParams()
   const update = useUpdateOrder({ onMutate: () => setOpen(false) })
   const [open, setOpen] = React.useState(false)

   return (
      <Popover
         open={open}
         onOpenChange={setOpen}
      >
         <PopoverTrigger
            render={
               <Button
                  className="col-span-2"
                  variant={"secondary"}
               >
                  {analogs.length === 0 ? (
                     <>
                        <Icons.lightBulb className="!-ml-[2px]" />
                        Запропонувати аналог
                     </>
                  ) : (
                     <>
                        <Icons.plus />
                        Додати
                     </>
                  )}
               </Button>
            }
         />
         <PopoverPopup align={analogs.length === 0 ? "start" : "end"}>
            <form
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{ name: string }>(e.target)
                  update.mutate({
                     id: orderId,
                     workspaceId: params.workspaceId,
                     analogs: [...analogs, form.name],
                  })
               }}
            >
               <Field>
                  <FieldLabel>Назва</FieldLabel>
                  <FieldControl
                     required
                     placeholder="Уведіть назву товару"
                     name="name"
                  />
               </Field>
               <Button className="mt-4 w-full">Додати</Button>
            </form>
         </PopoverPopup>
      </Popover>
   )
}

function ProcurementRow({
   item,
   sellingPrice,
   orderId,
   orderName,
   orderItems,
}: {
   item: Procurement
   sellingPrice: number
   orderId: string
   orderName: string
   orderItems: OrderItemType[]
}) {
   const params = Route.useParams()
   const theme = useTheme()
   const [from, to] = procurementStatusGradient(
      item.status,
      theme.resolvedTheme ?? "light",
   )
   const _profit = (sellingPrice - item.purchasePrice) * item.quantity
   const update = useUpdateProcurement()
   const deleteItem = useDeleteProcurement()

   const [editOpen, setEditOpen] = React.useState(false)
   const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <div className="gap-3 border-neutral border-t p-3 text-left first:border-none lg:gap-4 lg:p-2 lg:pl-3">
         {item.orderItem?.name ? (
            <p className="line-clamp-1 font-medium font-mono max-lg:w-[calc(100%-2rem)] lg:hidden lg:text-sm">
               {item.orderItem.name}
            </p>
         ) : null}
         <div className="flex w-full items-center gap-3 max-lg:mt-2 lg:gap-4">
            <AlignedColumn
               id={`${orderId}_p_creator`}
               className="flex items-center gap-1.5 whitespace-nowrap font-medium"
            >
               <UserAvatar
                  size={16}
                  user={item.creator}
                  className="inline-block"
               />
               {item.creator.name}
            </AlignedColumn>
            {item.orderItem ? (
               <AlignedColumn
                  id={`${orderId}_p_item_name`}
                  className="font-medium font-mono max-lg:hidden lg:text-sm"
               >
                  {item.orderItem.name}
               </AlignedColumn>
            ) : null}
            <AlignedColumn
               id={`${orderId}_p_quantity`}
               className="whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatNumber(item.quantity)} шт.
            </AlignedColumn>
            <Separator className={"h-4 w-px bg-surface-7 lg:hidden"} />
            <AlignedColumn
               id={`${orderId}_p_price`}
               className="whitespace-nowrap font-medium font-mono lg:text-sm"
            >
               {formatCurrency(item.purchasePrice)}
            </AlignedColumn>
            <Combobox
               value={item.status}
               onValueChange={(status) =>
                  update.mutate({
                     id: item.id,
                     workspaceId: params.workspaceId,
                     status: status as never,
                  })
               }
            >
               <ComboboxTrigger
                  className={"ml-auto cursor-pointer"}
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <Badge
                     size={"sm"}
                     style={{
                        background: `linear-gradient(140deg, ${from}, ${to})`,
                     }}
                  >
                     {PROCUREMENT_STATUSES_TRANSLATION[item.status]}
                  </Badge>
               </ComboboxTrigger>
               <ComboboxPopup
                  align="end"
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <ComboboxInput />
                  {PROCUREMENT_STATUSES.map((s) => (
                     <ComboboxItem
                        key={s}
                        value={s}
                        keywords={[PROCUREMENT_STATUSES_TRANSLATION[s]]}
                     >
                        {PROCUREMENT_STATUSES_TRANSLATION[s]}
                     </ComboboxItem>
                  ))}
               </ComboboxPopup>
            </Combobox>
            <Menu>
               <MenuTrigger
                  ref={menuTriggerRef}
                  render={
                     <Button
                        variant={"ghost"}
                        kind={"icon"}
                        className="shrink-0 max-lg:absolute max-lg:top-1 max-lg:right-1"
                     >
                        <Icons.ellipsisHorizontal />
                     </Button>
                  }
               />
               <MenuPopup
                  align="end"
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
               >
                  <MenuItem
                     onClick={() => {
                        setEditOpen(true)
                     }}
                  >
                     <Icons.pencil />
                     Редагувати
                  </MenuItem>
                  <MenuItem
                     destructive
                     onClick={() => setConfirmDeleteOpen(true)}
                  >
                     <Icons.trash />
                     Видалити
                  </MenuItem>
               </MenuPopup>
            </Menu>
         </div>
         <div className="mt-2 flex lg:mt-1">
            {item.provider ? (
               <>
                  <p className="lg:!max-w-[80ch] empty:hidden max-lg:mr-auto">
                     {item.provider}
                  </p>
                  <Separator className="mx-2.5 my-auto h-4 w-px" />
               </>
            ) : null}
            <p className="lg:!max-w-[80ch] whitespace-pre-wrap empty:hidden">
               {item.note}
            </p>
         </div>
         {/* <p className="col-start-1 whitespace-nowrap font-medium font-mono text-[1rem] max-lg:order-3 max-lg:self-center lg:mt-1 lg:ml-auto lg:text-right">
            {profit === 0 ? null : (
               <ProfitArrow
                  className="mr-1.5 mb-[-0.2rem] lg:mb-[-0.21rem]"
                  profit={profit > 0 ? "positive" : "negative"}
               />
            )}
            {formatCurrency(profit)}{" "}
         </p> */}

         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateProcurement
               orderItems={orderItems}
               orderName={orderName}
               procurement={item}
               open={editOpen}
               setOpen={setEditOpen}
               finalFocus={menuTriggerRef}
            />
            <AlertDialog
               open={confirmDeleteOpen}
               onOpenChange={setConfirmDeleteOpen}
            >
               <AlertDialogPopup
                  finalFocus={menuTriggerRef}
                  onClick={(e) => e.stopPropagation()}
               >
                  <AlertDialogTitle>Видалити закупівлю?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Буде видалена назавжди.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                     <AlertDialogClose
                        render={<Button variant="secondary">Відмінити</Button>}
                     />
                     <AlertDialogClose
                        render={
                           <Button
                              variant={"destructive"}
                              onClick={() =>
                                 deleteItem.mutate({
                                    id: item.id,
                                    workspaceId: params.workspaceId,
                                 })
                              }
                           >
                              Видалити
                           </Button>
                        }
                     />
                  </AlertDialogFooter>
               </AlertDialogPopup>
            </AlertDialog>
         </div>
      </div>
   )
}
