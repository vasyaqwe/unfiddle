import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import { useCreateOrderAssignee } from "@/order/assignee/mutations/create-order-assignee"
import { useDeleteOrderAssignee } from "@/order/assignee/mutations/delete-order-assignee"
import { CreateOrder } from "@/order/components/create-order"
import { SeverityIcon } from "@/order/components/severity-icon"
import { UpdateOrder } from "@/order/components/update-order"
import {
   ORDER_SEVERITIES_TRANSLATION,
   ORDER_STATUSES_TRANSLATION,
} from "@/order/constants"
import { useDeleteOrder } from "@/order/mutations/delete-order"
import { useUpdateOrder } from "@/order/mutations/update-order"
import { useOrderQueryOptions } from "@/order/queries"
import { expandedOrderIdsAtom } from "@/order/store"
import { formatOrderDate, orderStatusGradient } from "@/order/utils"
import { CreateProcurement } from "@/procurement/components/create-procurement"
import { UpdateProcurement } from "@/procurement/components/update-procurement"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
import { useDeleteProcurement } from "@/procurement/mutations/delete-procurement"
import { useUpdateProcurement } from "@/procurement/mutations/update-procurement"
import { procurementStatusGradient } from "@/procurement/utils"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { AlignedColumn } from "@/ui/components/aligned-column"
import { ErrorComponent } from "@/ui/components/error"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { Toggle } from "@base-ui-components/react/toggle"
import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@ledgerblocks/core/order/constants"
import { orderFilterSchema } from "@ledgerblocks/core/order/filter"
import { PROCUREMENT_STATUSES } from "@ledgerblocks/core/procurement/constants"
import type { Procurement } from "@ledgerblocks/core/procurement/types"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
import {
   AvatarStack,
   AvatarStackItem,
} from "@ledgerblocks/ui/components/avatar-stack"
import { Badge } from "@ledgerblocks/ui/components/badge"
import { Button } from "@ledgerblocks/ui/components/button"
import {} from "@ledgerblocks/ui/components/card"
import {
   Collapsible,
   CollapsiblePanel,
   CollapsibleTrigger,
   CollapsibleTriggerIcon,
} from "@ledgerblocks/ui/components/collapsible"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@ledgerblocks/ui/components/combobox"
import {
   AlertDialog,
   AlertDialogClose,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogPopup,
   AlertDialogTitle,
} from "@ledgerblocks/ui/components/dialog/alert"
import { DrawerTrigger } from "@ledgerblocks/ui/components/drawer"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { Input } from "@ledgerblocks/ui/components/input"
import {
   Menu,
   MenuCheckboxItem,
   MenuItem,
   MenuPopup,
   MenuSubmenuTrigger,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { ProfitArrow } from "@ledgerblocks/ui/components/profit-arrow"
import { Separator } from "@ledgerblocks/ui/components/separator"
import {
   Tooltip,
   TooltipPopup,
   TooltipTrigger,
} from "@ledgerblocks/ui/components/tooltip"
import { cx } from "@ledgerblocks/ui/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAtom } from "jotai"
import * as React from "react"
import * as R from "remeda"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/")({
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

   const queryOptions = useOrderQueryOptions()
   const query = useQuery(queryOptions.list)
   const data = query.data ?? []

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
         >
            {auth.workspace.role === "manager" ||
            auth.workspace.role === "admin" ? (
               <CreateOrder>
                  <DrawerTrigger
                     render={
                        <Button className="fixed right-3 bottom-[calc(var(--bottom-navigation-height)+0.75rem)] z-[10] overflow-visible shadow-md md:right-8 md:bottom-8 md:h-9 md:px-3">
                           <Icons.plus className="md:size-6" />
                           Замовлення
                        </Button>
                     }
                  />
               </CreateOrder>
            ) : null}
            <div className="mb-16">
               <div className="sticky top-0 z-[5] flex min-h-12 items-center gap-1 border-primary-5 border-b bg-background px-1.5 shadow-xs/4 lg:min-h-10">
                  <ToggleAll />
                  <ToggleArchived />
                  <FilterMenu />
                  <Search />
               </div>
               {query.isPending ? null : query.isError ? (
                  <ErrorComponent error={query.error} />
               ) : !data || data.length === 0 ? (
                  <Empty />
               ) : (
                  <div className={"divide-y divide-primary-5"}>
                     {data.map((item) => (
                        <OrderRow
                           key={item.id}
                           item={item}
                        />
                     ))}
                  </div>
               )}
            </div>
         </MainScrollArea>
      </>
   )
}

function ToggleAll() {
   const queryOptions = useOrderQueryOptions()
   const query = useQuery(queryOptions.list)
   const data = query.data ?? []

   const orderIds = data.map((item) => item.id)
   const [expandedOrderIds, setExpandedOrderIds] = useAtom(expandedOrderIdsAtom)

   return (
      <Toggle
         pressed={
            expandedOrderIds.filter((id) => orderIds.includes(id)).length > 0
         }
         onPressedChange={(pressed) =>
            !pressed ? setExpandedOrderIds([]) : setExpandedOrderIds(orderIds)
         }
         render={(props, state) => (
            <Button
               {...props}
               variant={"ghost"}
               kind={"icon"}
               size={"sm"}
            >
               <Icons.chevronUpDuo
                  className={cx(
                     "size-6 shrink-0 text-foreground/75 transition-all duration-150",
                     state.pressed ? "rotate-180" : "",
                  )}
               />
            </Button>
         )}
      />
   )
}

function ToggleArchived() {
   const params = Route.useParams()
   const search = Route.useSearch()
   const navigate = useNavigate()

   return (
      <Tooltip>
         <TooltipTrigger
            render={
               <Toggle
                  pressed={!!search.archived}
                  onPressedChange={(archived) => {
                     navigate({
                        to: ".",
                        params,
                        search: (prev) => ({
                           ...prev,
                           archived,
                        }),
                     })
                  }}
                  render={(props, state) => (
                     <Button
                        {...props}
                        kind={"icon"}
                        variant={"ghost"}
                        size={"sm"}
                        className="-ml-0.5"
                     >
                        {state.pressed ? (
                           <Icons.arrowLeft className="size-5" />
                        ) : (
                           <Icons.archive className="size-5" />
                        )}
                     </Button>
                  )}
               />
            }
         />
         <TooltipPopup>
            {search.archived ? "Показати усі" : "Показати архівовані"}
         </TooltipPopup>
      </Tooltip>
   )
}

function FilterMenu() {
   const search = Route.useSearch()
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()
   const query = useQuery(queryOptions.list)
   const data = query.data ?? []

   const onFilterChange = (
      key: "status" | "severity" | "creator",
      value: string,
      isChecked: boolean,
   ) => {
      const currentValues = search[key] ?? []
      const newValues = isChecked
         ? [...currentValues, value]
         : currentValues.filter((v) => v !== value)

      navigate({
         to: ".",
         search: (prev) => ({
            ...prev,
            [key]: newValues.length ? newValues : undefined,
         }),
      })
   }

   const selectedLength = Object.values(search)
      .filter((value) => Array.isArray(value))
      .reduce((total, arr) => total + arr.length, 0)

   const creators = Array.from(
      new Map(data.map((item) => [item.creator.id, item.creator])).values(),
   )

   const removeFilter = () => {
      navigate({
         to: ".",
         search: (prev) => ({
            ...prev,
            status: undefined,
            severity: undefined,
            creator: undefined,
         }),
      }).then(() => queryClient.invalidateQueries(queryOptions.list))
   }

   return (
      <>
         <Menu>
            <MenuTrigger
               render={
                  <Button
                     variant={"ghost"}
                     size={"sm"}
                  >
                     <Icons.filter className="size-5" />
                     Фільтр
                  </Button>
               }
            />
            <MenuPopup align="start">
               <Menu>
                  <MenuSubmenuTrigger>
                     <Icons.circle />
                     Статус
                  </MenuSubmenuTrigger>
                  <MenuPopup className={"max-h-56 overflow-y-auto"}>
                     {ORDER_STATUSES.map((status) => (
                        <MenuCheckboxItem
                           checked={search.status?.includes(status) ?? false}
                           onCheckedChange={(checked) =>
                              onFilterChange("status", status, checked)
                           }
                           key={status}
                        >
                           {ORDER_STATUSES_TRANSLATION[status]}
                        </MenuCheckboxItem>
                     ))}
                  </MenuPopup>
               </Menu>
               <Menu>
                  <MenuSubmenuTrigger>
                     <SeverityIcon
                        className="!w-[1.13rem] md:!w-4 !mx-0.5"
                        severity="high"
                     />
                     Пріорітет
                  </MenuSubmenuTrigger>
                  <MenuPopup>
                     {ORDER_SEVERITIES.map((severity) => (
                        <MenuCheckboxItem
                           checked={
                              search.severity?.includes(severity) ?? false
                           }
                           onCheckedChange={(checked) =>
                              onFilterChange("severity", severity, checked)
                           }
                           key={severity}
                        >
                           {ORDER_SEVERITIES_TRANSLATION[severity]}
                        </MenuCheckboxItem>
                     ))}
                  </MenuPopup>
               </Menu>
               <Menu>
                  <MenuSubmenuTrigger>
                     <Icons.user />
                     Менеджер
                  </MenuSubmenuTrigger>
                  <MenuPopup>
                     {creators.map((creator) => (
                        <MenuCheckboxItem
                           checked={
                              search.creator?.includes(creator.id) ?? false
                           }
                           onCheckedChange={(checked) =>
                              onFilterChange("creator", creator.id, checked)
                           }
                           key={creator.id}
                        >
                           {creator.name}
                        </MenuCheckboxItem>
                     ))}
                  </MenuPopup>
               </Menu>
            </MenuPopup>
         </Menu>

         {selectedLength === 0 ? null : (
            <Badge className="overflow-hidden pr-0">
               {selectedLength} обрано
               <Button
                  variant={"ghost"}
                  size={"sm"}
                  kind={"icon"}
                  onClick={removeFilter}
                  className="rounded-none"
               >
                  <Icons.xMark className="size-4" />
               </Button>
            </Badge>
         )}
      </>
   )
}

function Search() {
   const search = Route.useSearch()
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const queryOptions = useOrderQueryOptions()
   const [searching, setSearching] = React.useState(false)

   const onChange = R.funnel<[string], void>(
      (query) => {
         navigate({
            to: ".",
            search: (prev) => ({
               ...prev,
               q: query ?? undefined,
            }),
            replace: true,
         })
      },
      { minQuietPeriodMs: 300, reducer: (_acc, newQuery) => newQuery },
   )

   const active = searching || (search.q && search.q.length > 0)

   return (
      <div className="relative ml-auto flex h-9 max-w-[320px] items-center md:h-9">
         {active ? (
            <Input
               autoFocus
               className={"h-9 border-b-0 pt-0 pr-10 md:h-9 md:pt-0"}
               defaultValue={search.q}
               placeholder="Шукати.."
               onChange={(e) => onChange.call(e.target.value)}
            />
         ) : null}
         <Button
            variant={"ghost"}
            kind={"icon"}
            size={"sm"}
            className="absolute inset-y-0 right-0 my-auto"
            type="button"
            onClick={() => {
               if (!active) return setSearching(true)

               navigate({
                  to: ".",
                  search: (prev) => ({
                     ...prev,
                     q: undefined,
                  }),
               }).then(() => queryClient.invalidateQueries(queryOptions.list))
               setSearching(false)
            }}
         >
            {active ? (
               <Icons.xMark className="size-[18px]" />
            ) : (
               <Icons.search className="size-[18px]" />
            )}
         </Button>
      </div>
   )
}

function Empty() {
   const search = Route.useSearch()
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
               <>
                  {" "}
                  {search.archived ? (
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-12"
                        viewBox="0 0 18 18"
                     >
                        <g fill="currentColor">
                           <path
                              d="M15.75,8.5c-.414,0-.75-.336-.75-.75v-1.5c0-.689-.561-1.25-1.25-1.25h-5.386c-.228,0-.443-.104-.585-.281l-.603-.752c-.238-.297-.594-.467-.975-.467h-1.951c-.689,0-1.25,.561-1.25,1.25v3c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-3c0-1.517,1.233-2.75,2.75-2.75h1.951c.838,0,1.62,.375,2.145,1.029l.378,.471h5.026c1.517,0,2.75,1.233,2.75,2.75v1.5c0,.414-.336,.75-.75,.75Z"
                              fill="currentColor"
                           />
                           <path
                              d="M17.082,7.879c-.43-.559-1.08-.879-1.785-.879H2.703c-.705,0-1.355,.32-1.785,.879-.429,.559-.571,1.27-.39,1.951l1.101,4.128c.32,1.202,1.413,2.042,2.657,2.042H13.713c1.244,0,2.337-.839,2.657-2.042l1.101-4.128c.182-.681,.04-1.392-.39-1.951Z"
                              fill="currentColor"
                           />
                        </g>
                     </svg>
                  ) : (
                     <svg
                        className=" size-12"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                     >
                        <g fill="currentColor">
                           <path
                              d="M2.424,17.977l.068-10.18c.012-1.843,1.301-3.423,3.08-3.775l9.831-1.949c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.013,1.842-1.302,3.421-3.081,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.828Z"
                              opacity=".2"
                           />
                           <path
                              d="M7.241,22.039l.068-10.182c.011-1.841,1.301-3.42,3.08-3.773l9.831-1.948c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.012,1.842-1.301,3.421-3.08,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.827v-.002Z"
                              opacity=".5"
                           />
                           <path
                              d="M12.058,26.1l.068-10.182c.012-1.843,1.301-3.421,3.08-3.774l9.831-1.949c2.362-.468,4.555,1.38,4.539,3.827l-.068,10.182c-.012,1.843-1.301,3.422-3.08,3.774l-9.831,1.949c-2.362,.468-4.555-1.38-4.539-3.827h0Z"
                              opacity=".8"
                           />
                        </g>
                     </svg>
                  )}
               </>
            )}
         </div>
         <p className="mb-2 font-medium text-foreground/90 text-lg">
            {search.archived ? "В архіві нічого немає" : "Немає замовлень"}
         </p>
      </div>
   )
}

function OrderRow({
   item,
}: {
   item: RouterOutput["order"]["list"][number]
}) {
   const params = Route.useParams()
   const auth = useAuth()
   const [expandedOrderIds, setExpandedOrderIds] = useAtom(expandedOrderIdsAtom)
   const [from, to] = orderStatusGradient(item.status)

   const update = useUpdateOrder()
   const deleteItem = useDeleteOrder()
   const createAssignee = useCreateOrderAssignee()
   const deleteAssignee = useDeleteOrderAssignee()

   const [editOpen, setEditOpen] = React.useState(false)
   const [confirmArchiveOpen, setConfirmArchiveOpen] = React.useState(false)
   const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const totalProfit = item.procurements.reduce(
      (acc, p) =>
         acc + ((item.sellingPrice ?? 0) - p.purchasePrice) * p.quantity,
      0,
   )

   return (
      <Collapsible
         open={expandedOrderIds.includes(item.id)}
         onOpenChange={(open) =>
            setExpandedOrderIds(
               open
                  ? [...expandedOrderIds, item.id]
                  : expandedOrderIds.filter((id) => id !== item.id),
            )
         }
      >
         <CollapsibleTrigger
            render={<div />}
            className="relative grid grid-cols-2 grid-rows-[1fr_auto] gap-x-2.5 gap-y-1.5 py-2 pr-1.5 pl-2.5 text-left transition-colors duration-50 first:border-none hover:bg-primary-1 has-data-[popup-open]:bg-primary-1 aria-expanded:bg-primary-1 lg:flex lg:py-[0.4rem]"
         >
            <div className="flex items-center gap-2">
               <CollapsibleTriggerIcon className="lg:mr-0.5 lg:mb-px" />
               <SeverityIcon
                  severity={item.severity}
                  className="mr-[2px] opacity-60 transition-opacity duration-75 group-hover/severity:opacity-90 group-data-[popup-open]/severity:opacity-90 lg:mb-[2px]"
               />
               <p className="whitespace-nowrap font-medium font-mono text-foreground/75 text-sm">
                  №{String(item.shortId).padStart(3, "0")}
               </p>
               <AlignedColumn
                  id={`o_creator`}
                  className="flex items-center gap-[3px] whitespace-nowrap font-medium text-sm"
               >
                  <UserAvatar
                     size={17}
                     user={item.creator}
                     className="inline-block"
                  />
                  <span className="whitespace-nowrap">{item.creator.name}</span>
               </AlignedColumn>
            </div>
            <p className="lg:!max-w-[80%] col-span-2 col-start-1 row-start-2 mt-px w-[calc(100%-36px)] break-normal font-semibold max-lg:pl-1">
               {item.name}
            </p>
            <div className="ml-auto flex items-center gap-3.5">
               <AvatarStack className="mt-px max-md:hidden">
                  {item.assignees.map((assignee) => (
                     <AvatarStackItem key={assignee.user.id}>
                        <Tooltip delay={0}>
                           <TooltipTrigger
                              render={
                                 <UserAvatar
                                    size={24}
                                    user={assignee.user}
                                 />
                              }
                           />
                           <TooltipPopup>{assignee.user.name}</TooltipPopup>
                        </Tooltip>
                     </AvatarStackItem>
                  ))}
               </AvatarStack>
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
                     onClick={(e) => {
                        e.stopPropagation()
                     }}
                     className={" cursor-pointer"}
                  >
                     <Badge
                        style={{
                           background: `linear-gradient(140deg, ${from}, ${to})`,
                        }}
                     >
                        {ORDER_STATUSES_TRANSLATION[item.status]}{" "}
                        {item.status === "successful"
                           ? `(${formatCurrency(totalProfit)})`
                           : ""}
                     </Badge>
                  </ComboboxTrigger>
                  <ComboboxPopup
                     align="end"
                     onClick={(e) => {
                        e.stopPropagation()
                     }}
                  >
                     <ComboboxInput />
                     {ORDER_STATUSES.map((s) => (
                        <ComboboxItem
                           key={s}
                           value={s}
                           keywords={[ORDER_STATUSES_TRANSLATION[s]]}
                        >
                           {ORDER_STATUSES_TRANSLATION[s]}
                        </ComboboxItem>
                     ))}
                  </ComboboxPopup>
               </Combobox>
            </div>
            <p className="min-w-[60px] text-foreground/75 max-lg:hidden">
               {formatOrderDate(item.createdAt)}
            </p>
            <div
               className="absolute"
               onClick={(e) => e.stopPropagation()}
            >
               <UpdateOrder
                  open={editOpen}
                  setOpen={setEditOpen}
                  order={item}
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
                        Архівувати {item.name}?,{" "}
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
                                       id: item.id,
                                       workspaceId: params.workspaceId,
                                       deletedAt: new Date().toString(),
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
                        Видалити {item.name}?,{" "}
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
            <Menu>
               <MenuTrigger
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
                  {item.deletedAt === null ? (
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
                              id: item.id,
                              workspaceId: params.workspaceId,
                              deletedAt: null,
                           })
                        }
                     >
                        <Icons.undo />
                        Відновити
                     </MenuItem>
                  )}
                  {item.deletedAt && auth.user.id === item.creatorId ? (
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
            key={item.procurements.length}
            render={
               <div className="border-neutral border-t bg-primary-3/60 pt-4 lg:pt-3">
                  <div className="container mb-4">
                     <div className="mb-4 flex items-center gap-3">
                        <p className="whitespace-nowrap font-medium font-mono text-black text-lg leading-tight lg:text-[1rem]">
                           {formatNumber(item.quantity)} шт.
                        </p>
                        <Separator className={"h-6 w-px bg-primary-7"} />
                        <p className="whitespace-nowrap font-medium font-mono text-black text-lg leading-tight lg:text-[1rem]">
                           {item.sellingPrice
                              ? formatCurrency(item.sellingPrice)
                              : "Без ціни"}
                        </p>
                     </div>
                     <p
                        className={cx(
                           "mb-4 flex gap-1 font-medium text-foreground/75",
                           item.note.length === 0 ? "hidden" : "",
                        )}
                     >
                        <svg
                           className="mt-[0.1rem] size-4.5 shrink-0"
                           viewBox="0 0 24 24"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           />
                        </svg>
                        {item.note}
                     </p>
                     {item.procurements.length === 0 ? (
                        <p className="font-medium text-foreground/80">
                           Ще немає закупівель.
                        </p>
                     ) : (
                        <div className="relative z-[2] rounded-lg border border-neutral bg-background shadow-xs/4">
                           {item.procurements.map((p) => (
                              <ProcurementRow
                                 key={p.id}
                                 item={p}
                                 sellingPrice={item.sellingPrice ?? 0}
                                 orderId={item.id}
                              />
                           ))}
                        </div>
                     )}
                     {auth.workspace.role === "buyer" ||
                     auth.workspace.role === "admin" ? (
                        <div className="mt-3 flex grid-cols-2 items-center gap-2 max-sm:grid">
                           <CreateProcurement
                              orderName={item.name}
                              orderId={item.id}
                              empty={item.procurements.length === 0}
                           />
                           <Toggle
                              pressed={item.assignees.some(
                                 (a) => a.user.id === auth.user.id,
                              )}
                              render={(props, state) => (
                                 <Button
                                    {...props}
                                    variant={"secondary"}
                                    onClick={() => {
                                       if (state.pressed)
                                          return deleteAssignee.mutate({
                                             orderId: item.id,
                                             userId: auth.user.id,
                                             workspaceId: auth.workspace.id,
                                          })

                                       createAssignee.mutate({
                                          orderId: item.id,
                                          userId: auth.user.id,
                                          workspaceId: auth.workspace.id,
                                       })
                                    }}
                                 >
                                    {state.pressed ? (
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
                                 </Button>
                              )}
                           />
                        </div>
                     ) : null}
                  </div>
               </div>
            }
         />
      </Collapsible>
   )
}

function ProcurementRow({
   item,
   sellingPrice,
   orderId,
}: {
   item: Procurement
   sellingPrice: number
   orderId: string
}) {
   const params = Route.useParams()
   const [from, to] = procurementStatusGradient(item.status)
   const profit = (sellingPrice - item.purchasePrice) * item.quantity

   const update = useUpdateProcurement()
   const deleteItem = useDeleteProcurement()

   const [editOpen, setEditOpen] = React.useState(false)
   const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <div className="grid-cols-[1fr_1fr_var(--spacing-9)] items-start gap-3 border-neutral border-t p-3 text-left first:border-none max-lg:grid lg:flex lg:gap-4 lg:p-2 lg:pl-3">
         <AlignedColumn
            id={`${orderId}_p_buyer`}
            className="flex items-center gap-1.5 whitespace-nowrap font-medium lg:mt-[0.17rem]"
         >
            <UserAvatar
               size={16}
               user={item.buyer}
               className="inline-block"
            />
            {item.buyer.name}
         </AlignedColumn>
         <span className="col-end-4 flex items-center justify-end gap-2 lg:gap-4">
            <AlignedColumn
               id={`${orderId}_p_quantity`}
               className="whitespace-nowrap font-medium font-mono lg:mt-1 lg:text-sm"
            >
               {formatNumber(item.quantity)} шт.
            </AlignedColumn>
            <Separator className={"h-4 w-px bg-primary-7 lg:hidden"} />
            <AlignedColumn
               id={`${orderId}_p_price`}
               className="whitespace-nowrap font-medium font-mono lg:mt-1 lg:text-sm"
            >
               {formatCurrency(item.purchasePrice)}
            </AlignedColumn>
         </span>
         <AlignedColumn
            className="col-end-4 mt-[2px] justify-self-end max-lg:order-4 lg:mt-[2px]"
            id="p_status"
         >
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
                  className={"cursor-pointer"}
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
                  align="start"
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
         </AlignedColumn>
         <p className="lg:!max-w-[80ch] col-span-2 mt-2 break-normal empty:hidden max-lg:order-5 lg:mt-1">
            {item.note}
         </p>
         <p className="col-start-1 whitespace-nowrap font-medium font-mono text-[1rem] max-lg:order-3 max-lg:self-center lg:mt-1 lg:ml-auto lg:text-right">
            {profit === 0 ? null : (
               <ProfitArrow
                  className="mr-1.5 mb-[-0.2rem] lg:mb-[-0.21rem]"
                  profit={profit > 0 ? "positive" : "negative"}
               />
            )}
            {formatCurrency(profit)}{" "}
         </p>
         <div
            className="absolute"
            onClick={(e) => e.stopPropagation()}
         >
            <UpdateProcurement
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
         <Menu>
            <MenuTrigger
               ref={menuTriggerRef}
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="col-start-3 shrink-0 justify-self-end max-lg:order-last max-lg:mt-auto"
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
   )
}
