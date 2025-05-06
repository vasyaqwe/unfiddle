import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import { CreateOrder } from "@/order/components/create-order"
import { EditOrder } from "@/order/components/edit-order"
import { SeverityIcon } from "@/order/components/severity-icon"
import {
   ORDER_SEVERITIES_TRANSLATION,
   ORDER_STATUSES_TRANSLATION,
} from "@/order/constants"
import { useDeleteOrder } from "@/order/mutations/delete"
import { useUpdateOrder } from "@/order/mutations/update"
import { orderStatusGradient } from "@/order/utils"
import { CreateProcurement } from "@/procurement/components/create-procurement"
import { EditProcurement } from "@/procurement/components/edit-procurement"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
import { useDeleteProcurement } from "@/procurement/mutations/delete"
import { useUpdateProcurement } from "@/procurement/mutations/update"
import { procurementStatusGradient } from "@/procurement/utils"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import {
   ORDER_SEVERITIES,
   ORDER_STATUSES,
} from "@ledgerblocks/core/order/constants"
import { PROCUREMENT_STATUSES } from "@ledgerblocks/core/procurement/constants"
import type { RouterOutput } from "@ledgerblocks/core/trpc/types"
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
import { Separator } from "@ledgerblocks/ui/components/separator"
import { cn, cx } from "@ledgerblocks/ui/utils"
import {
   keepPreviousData,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import * as React from "react"
import * as R from "remeda"
import { z } from "zod"

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
   validateSearch: validator(
      z.object({
         status: z.array(z.enum(ORDER_STATUSES)).optional(),
         severity: z.array(z.enum(ORDER_SEVERITIES)).optional(),
         q: z.string().optional(),
      }),
   ),
})

function RouteComponent() {
   const queryClient = useQueryClient()
   const params = Route.useParams()
   const search = Route.useSearch()
   const navigate = useNavigate()
   const auth = useAuth()

   const query = useQuery(
      trpc.order.list.queryOptions(
         {
            workspaceId: params.workspaceId,
            filter: search,
         },
         { placeholderData: keepPreviousData },
      ),
   )

   const groupedData = R.groupBy(query.data ?? [], R.prop("creatorId"))

   const onFilterChange = (
      key: "status" | "severity",
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

   const [searching, setSearching] = React.useState(false)

   const onSearch = R.funnel<[string], void>(
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
      { minQuietPeriodMs: 350, reducer: (_acc, newQuery) => newQuery },
   )

   const removeFilter = () => {
      navigate({ to: "." }).then(() =>
         queryClient.invalidateQueries(
            trpc.order.list.queryOptions(
               {
                  workspaceId: params.workspaceId,
               },
               {
                  placeholderData: keepPreviousData,
               },
            ),
         ),
      )
      setSearching(false)
   }

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle className="line-clamp-1">
               {auth.workspace.name}
            </HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea container={false}>
            <CreateOrder>
               <DrawerTrigger
                  render={
                     <Button className="fixed right-3 bottom-[calc(var(--bottom-navigation-height)+0.75rem)] z-[10] overflow-visible shadow-md md:hidden">
                        <Icons.plus className="size-6" />
                        Замовлення
                     </Button>
                  }
               />
            </CreateOrder>
            <div className="mb-16 ">
               <div className="flex min-h-[44px] items-center gap-1 px-4 lg:px-8">
                  <Menu>
                     <MenuTrigger
                        render={
                           <Button
                              variant={"ghost"}
                              size={"sm"}
                              className="-ml-2"
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
                                    checked={
                                       search.status?.includes(status) ?? false
                                    }
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
                                 className="!w-4 !mx-0.5"
                                 severity="high"
                              />
                              Пріорітет
                           </MenuSubmenuTrigger>
                           <MenuPopup>
                              {ORDER_SEVERITIES.map((severity) => (
                                 <MenuCheckboxItem
                                    checked={
                                       search.severity?.includes(severity) ??
                                       false
                                    }
                                    onCheckedChange={(checked) =>
                                       onFilterChange(
                                          "severity",
                                          severity,
                                          checked,
                                       )
                                    }
                                    key={severity}
                                 >
                                    {ORDER_SEVERITIES_TRANSLATION[severity]}
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
                  {searching || (search.q && search.q.length > 0) ? (
                     <div className="relative ml-auto flex max-w-[320px] items-center">
                        <Input
                           autoFocus
                           className={
                              "h-9 border-b-0 pt-0 pr-10 md:h-9 md:pt-0"
                           }
                           defaultValue={search.q}
                           placeholder="Шукати.."
                           onChange={(e) => onSearch.call(e.target.value)}
                        />
                        <Button
                           variant={"ghost"}
                           kind={"icon"}
                           size={"sm"}
                           className="absolute inset-y-0 right-0 my-auto"
                           type="button"
                           onClick={removeFilter}
                        >
                           <Icons.xMark className="size-[18px]" />
                        </Button>
                     </div>
                  ) : (
                     <Button
                        onClick={() => setSearching(true)}
                        className="ml-auto"
                        variant={"ghost"}
                        kind={"icon"}
                     >
                        <Icons.search className="size-[18px]" />
                     </Button>
                  )}
               </div>
               {query.isPending ? null : query.isError ? (
                  <ErrorComponent error={query.error} />
               ) : !query.data || query.data.length === 0 ? (
                  <div className="-translate-y-8 absolute inset-0 m-auto size-fit text-center">
                     <svg
                        className="mx-auto mb-5 size-12"
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
                     <p className="mb-2 font-semibold text-xl">
                        Тут нічого немає
                     </p>
                     <p className="text-foreground/75">
                        Додайте перше замовлення
                     </p>
                  </div>
               ) : (
                  Object.entries(groupedData).map(([creatorId, data]) => {
                     const creator = data.find(
                        (item) => item.creatorId === creatorId,
                     )?.creator
                     if (!creator) return null

                     return (
                        <div
                           key={creatorId}
                           className="group relative"
                        >
                           <div className="border-primary-5 border-y bg-primary-2 py-2.5 ">
                              <div className="px-4 lg:px-8">
                                 <p className="flex items-center gap-1.5 font-medium">
                                    <UserAvatar user={creator} />
                                    {creator.name}
                                    <span className="ml-1 text-foreground/70">
                                       {data.length}
                                    </span>
                                 </p>
                              </div>
                           </div>
                           <div
                              className={
                                 "divide-y divide-neutral lg:divide-primary-5"
                              }
                           >
                              {data.map((item) => (
                                 <OrderRow
                                    key={item.id}
                                    item={item}
                                 />
                              ))}
                           </div>
                        </div>
                     )
                  })
               )}
            </div>
         </MainScrollArea>
      </>
   )
}

const columnWidthsAtom = atom<Record<string, number>>({})

function AlignedColumn({
   id,
   children,
   className = "",
}: {
   id: string
   children: React.ReactNode
   className?: string
}) {
   const [columnWidths, setColumnWidths] = useAtom(columnWidthsAtom)
   const [isMobile, setIsMobile] = React.useState(true)

   React.useEffect(() => {
      const checkDevice = (event: MediaQueryList | MediaQueryListEvent) =>
         setIsMobile(event.matches)
      const mediaQueryList = window.matchMedia(`(max-width: 1024px)`)
      checkDevice(mediaQueryList)
      mediaQueryList.addEventListener("change", checkDevice)
      return () => {
         mediaQueryList.removeEventListener("change", checkDevice)
      }
   }, [])

   return (
      <p
         ref={(el) => {
            if (!el || isMobile) return

            const width = el.getBoundingClientRect().width
            if (!columnWidths[id] || width > columnWidths[id]) {
               setColumnWidths((prev) => ({
                  ...prev,
                  [id]: width,
               }))
            }
         }}
         className={cn(
            "max-lg:![--min-width:auto] min-w-(--min-width)",
            className,
         )}
         style={{ "--min-width": `${columnWidths[id] || "auto"}px` } as never}
      >
         {children}
      </p>
   )
}

const collapsiblesStateAtom = atomWithStorage<Record<string, boolean>>(
   "collapsibles-open-states",
   {
      section1: false,
      section2: false,
      section3: false,
   },
)

function OrderRow({
   item,
}: {
   item: RouterOutput["order"]["list"][number]
}) {
   const params = Route.useParams()
   const [states, setStates] = useAtom(collapsiblesStateAtom)
   const [from, to] = orderStatusGradient(item.status)

   const open = states[item.id] ?? false
   const setOpen = (open: boolean) => {
      setStates({
         ...states,
         [item.id]: open,
      })
   }

   const update = useUpdateOrder()
   const deleteItem = useDeleteOrder()

   const [editOpen, setEditOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <Collapsible
         open={open}
         onOpenChange={setOpen}
      >
         <CollapsibleTrigger
            render={<div />}
            className="container relative grid grid-cols-[100px_1fr] grid-rows-[1fr_auto] gap-x-3 gap-y-1 py-2 text-left transition-colors duration-50 first:border-none hover:bg-primary-1 has-data-[popup-open]:bg-primary-2 aria-expanded:bg-primary-2 lg:flex lg:py-1"
         >
            <div className="flex items-center gap-2">
               <CollapsibleTriggerIcon className="left-2.5 lg:absolute lg:mb-px" />
               <div className={"flex h-9 w-6 justify-center"}>
                  <SeverityIcon
                     severity={item.severity}
                     className="mr-[2px] opacity-60 transition-opacity duration-75 group-hover/severity:opacity-90 group-data-[popup-open]/severity:opacity-90 lg:mb-[2px]"
                  />
               </div>
               {/* <Combobox
                  value={item.severity}
                  onValueChange={(severity) =>
                     update.mutate({
                        id: item.id,
                        workspaceId: params.workspaceId,
                        severity: severity as never,
                     })
                  }
               >
                  <ComboboxTrigger
                     onClick={(e) => {
                        e.stopPropagation()
                     }}
                     className={"group/severity flex h-9 w-6 justify-center"}
                  >
                     <SeverityIcon
                        severity={item.severity}
                        className="mr-[2px] opacity-60 transition-opacity duration-75 group-hover/severity:opacity-90 group-data-[popup-open]/severity:opacity-90 lg:mb-[2px]"
                     />
                  </ComboboxTrigger>
                  <ComboboxPopup
                     className={"w-40"}
                     sideOffset={0}
                     align="start"
                     onClick={(e) => {
                        e.stopPropagation()
                     }}
                  >
                     <ComboboxInput placeholder="Пріорітет" />
                     {ORDER_SEVERITIES.map((s) => (
                        <ComboboxItem
                           key={s}
                           value={s}
                           keywords={[ORDER_SEVERITIES_TRANSLATION[s]]}
                        >
                           {ORDER_SEVERITIES_TRANSLATION[s]}
                        </ComboboxItem>
                     ))}
                  </ComboboxPopup>
               </Combobox> */}
               <p className="whitespace-nowrap font-medium font-mono text-foreground/75">
                  №{String(item.shortId).padStart(3, "0")}
               </p>
            </div>
            <p className="col-span-2 row-start-2 break-normal font-semibold max-lg:order-last">
               {item.name}
            </p>
            <div className="ml-auto flex items-center gap-2">
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
                     className={"cursor-pointer"}
                  >
                     <Badge
                        style={{
                           background: `linear-gradient(140deg, ${from}, ${to})`,
                        }}
                     >
                        {ORDER_STATUSES_TRANSLATION[item.status]}
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
               <EditOrder
                  open={editOpen}
                  setOpen={setEditOpen}
                  order={item}
                  finalFocus={menuTriggerRef}
               />
               <Menu>
                  <MenuTrigger
                     ref={menuTriggerRef}
                     render={
                        <Button
                           variant={"ghost"}
                           kind={"icon"}
                           className="-mr-2 shrink-0"
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
                        onClick={() => {
                           if (confirm(`Видалити замовлення ${item.name}?`))
                              deleteItem.mutate({
                                 id: item.id,
                                 workspaceId: params.workspaceId,
                              })
                        }}
                     >
                        <Icons.trash />
                        Видалити
                     </MenuItem>
                  </MenuPopup>
               </Menu>
            </div>
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
                           {formatCurrency(item.sellingPrice)}
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
                        <div className="relative z-[2] rounded-lg border border-neutral bg-background shadow-md/4">
                           {item.procurements.map((p) => (
                              <ProcurementRow
                                 key={p.id}
                                 item={p}
                                 sellingPrice={item.sellingPrice}
                                 orderId={item.id}
                              />
                           ))}
                        </div>
                     )}
                     <CreateProcurement
                        orderName={item.name}
                        orderId={item.id}
                        empty={item.procurements.length === 0}
                     />
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
   item: RouterOutput["order"]["list"][number]["procurements"][number]
   sellingPrice: number
   orderId: string
}) {
   const params = Route.useParams()
   const [from, to] = procurementStatusGradient(item.status)
   const profit = (sellingPrice - item.purchasePrice) * item.quantity

   const update = useUpdateProcurement()
   const deleteItem = useDeleteProcurement()

   const [editOpen, setEditOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   return (
      <div className="grid-cols-[1fr_1fr_var(--spacing-9)] items-start gap-3 border-neutral border-t px-4 py-3 text-left first:border-none max-lg:grid lg:flex lg:gap-4 lg:py-2">
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
            className="col-end-4 mt-[2px] justify-self-end max-lg:order-4 lg:mt-[0.2rem]"
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
            <span
               className={cx(
                  "mr-1.5 mb-[-0.2rem] inline-block size-4.5 rounded-xs lg:mb-[-0.21rem]",
                  profit === 0
                     ? "!hidden"
                     : profit > 0
                       ? "bg-green-3"
                       : "bg-red-3",
               )}
            >
               {profit === 0 ? null : profit > 0 ? (
                  <Icons.arrowUpRight className="-mt-px -ml-px size-5 text-green-10" />
               ) : (
                  <Icons.arrowDownRight className="-mt-px -ml-px size-5 text-red-10" />
               )}{" "}
            </span>
            {formatCurrency(profit)}{" "}
         </p>
         <EditProcurement
            procurement={item}
            open={editOpen}
            setOpen={setEditOpen}
            finalFocus={menuTriggerRef}
         />
         <Menu>
            <MenuTrigger
               ref={menuTriggerRef}
               render={
                  <Button
                     variant={"ghost"}
                     kind={"icon"}
                     className="lg:-mr-2 col-start-3 shrink-0 justify-self-end max-lg:order-last max-lg:mt-auto"
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
                  onClick={() => {
                     if (confirm(`Видалити закупівлю?`))
                        deleteItem.mutate({
                           id: item.id,
                           workspaceId: params.workspaceId,
                        })
                  }}
               >
                  <Icons.trash />
                  Видалити
               </MenuItem>
            </MenuPopup>
         </Menu>
      </div>
   )
}
