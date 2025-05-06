import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import { CreateOrder } from "@/order/components/create-order"
import { ORDER_STATUSES_TRANSLATION } from "@/order/constants"
import { useDeleteOrder } from "@/order/mutations/delete"
import { useUpdateOrder } from "@/order/mutations/update"
import { orderStatusGradient } from "@/order/utils"
import { CreateProcurement } from "@/procurement/components/create-procurement"
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
import { UserAvatar } from "@/user/components/user-avatar"
import { ORDER_STATUSES } from "@ledgerblocks/core/order/constants"
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
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
import { Separator } from "@ledgerblocks/ui/components/separator"
import { cn, cx } from "@ledgerblocks/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import * as React from "react"
import * as R from "remeda"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/")({
   component: RouteComponent,
   loader: async ({ context, params }) => {
      context.queryClient.prefetchQuery(
         trpc.order.list.queryOptions({
            workspaceId: params.workspaceId,
         }),
      )
   },
})

function RouteComponent() {
   const params = Route.useParams()
   const auth = useAuth()

   const query = useQuery(
      trpc.order.list.queryOptions({ workspaceId: params.workspaceId }),
   )

   const groupedData = R.groupBy(query.data ?? [], R.prop("creatorId"))

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
            <CreateOrder>
               <DrawerTrigger
                  render={
                     <Button className="fixed right-3 bottom-[calc(var(--bottom-navigation-height)+0.75rem)] z-[10] overflow-visible md:hidden">
                        <Icons.plus className="size-6" />
                        Замовлення
                     </Button>
                  }
               />
            </CreateOrder>
            <div className="mb-16">
               {Object.entries(groupedData).map(([creatorId, data]) => {
                  const creator = data.find(
                     (item) => item.creatorId === creatorId,
                  )?.creator
                  if (!creator) return null

                  return (
                     <div
                        key={creatorId}
                        className="group relative"
                     >
                        <div className="border-neutral border-y bg-primary-1 py-2 group-first:border-t-0">
                           <div className="px-4 lg:px-8">
                              <p className="font-medium">
                                 <UserAvatar
                                    size={16}
                                    user={creator}
                                    className="mr-1.5 inline-block align-text-top"
                                 />
                                 {creator.name}
                                 <span className="ml-1 text-foreground/70">
                                    {data.length}
                                 </span>
                              </p>
                           </div>
                        </div>
                        <div
                           className={
                              "divide-y divide-neutral lg:divide-neutral/75"
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
               })}
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

   return (
      <Collapsible
         open={open}
         onOpenChange={setOpen}
      >
         <CollapsibleTrigger
            render={<div />}
            className="container relative grid grid-cols-[100px_1fr] grid-rows-[1fr_auto] gap-x-3 gap-y-1 pt-2 pb-2.5 text-left transition-colors duration-50 first:border-none hover:bg-primary-1 has-data-[popup-open]:bg-primary-1 aria-expanded:bg-primary-1 lg:flex lg:py-2"
         >
            <p className="self-center whitespace-nowrap font-medium font-mono text-foreground/75">
               <CollapsibleTriggerIcon className="mr-2 inline-block align-baseline" />
               №{String(item.shortId).padStart(3, "0")}
            </p>
            <p className="col-span-2 row-start-2 font-semibold max-lg:order-last">
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
               <Menu>
                  <MenuTrigger
                     render={
                        <Button
                           variant={"ghost"}
                           kind={"icon"}
                           className="shrink-0"
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
                           {formatCurrency(item.sellingPrice)}
                        </p>
                        <Separator className={"h-6 w-px bg-primary-7"} />
                        <p className="whitespace-nowrap font-medium font-mono text-black text-lg leading-tight lg:text-[1rem]">
                           {formatNumber(item.quantity)} шт.
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
}: {
   item: RouterOutput["order"]["list"][number]["procurements"][number]
   sellingPrice: number
}) {
   const params = Route.useParams()
   const [from, to] = procurementStatusGradient(item.status)
   const profit = (sellingPrice - item.purchasePrice) * item.quantity

   const update = useUpdateProcurement()
   const deleteItem = useDeleteProcurement()

   return (
      <div className="grid-cols-[1fr_1fr_var(--spacing-9)] items-start gap-3 border-neutral border-t px-4 py-3 text-left first:border-none max-lg:grid lg:flex lg:gap-4 lg:py-2">
         <AlignedColumn
            id="p_buyer"
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
               id="p_price"
               className="whitespace-nowrap font-medium font-mono lg:mt-1 lg:text-sm"
            >
               {formatCurrency(item.purchasePrice)}
            </AlignedColumn>
            <Separator className={"h-4 w-px bg-primary-7 lg:hidden"} />
            <AlignedColumn
               id="p_quantity"
               className="whitespace-nowrap font-medium font-mono lg:mt-1 lg:text-sm"
            >
               {formatNumber(item.quantity)} шт.
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
         <p className="col-start-1 whitespace-nowrap font-medium font-mono text-lg max-lg:order-3 max-lg:self-center lg:mt-1 lg:ml-auto lg:text-right lg:text-base">
            <span
               className={cx(
                  "mr-1.5 mb-[-0.15rem] inline-block size-4.5 rounded-xs lg:mb-[-0.21rem]",
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
         <Menu>
            <MenuTrigger
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
