import { CACHE_SHORT } from "@/api"
import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { useEventListener } from "@/interactions/use-event-listener"
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
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
import {
   Collapsible,
   CollapsiblePanel,
   CollapsibleTrigger,
} from "@ledgerblocks/ui/components/collapsible"
import {
   Combobox,
   ComboboxInput,
   ComboboxItem,
   ComboboxPopup,
   ComboboxTrigger,
} from "@ledgerblocks/ui/components/combobox"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@ledgerblocks/ui/components/menu"
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
         trpc.order.list.queryOptions(
            {
               workspaceId: params.workspaceId,
            },
            { staleTime: CACHE_SHORT },
         ),
      )
   },
})

const currentGreeting = () => {
   const hour = new Date().getHours()
   if (hour < 12) return "Добрий ранок"
   if (hour < 18) return "Добрий день"
   return "Добрий вечір"
}

function RouteComponent() {
   const params = Route.useParams()
   const auth = useAuth()
   const documentRef = React.useRef<Document>(document)

   const [greeting, setGreeting] = React.useState(currentGreeting())
   useEventListener(
      "visibilitychange",
      () => {
         if (document.visibilityState === "visible")
            setGreeting(currentGreeting())
      },
      documentRef,
   )

   const query = useQuery(
      trpc.order.list.queryOptions(
         { workspaceId: params.workspaceId },
         {
            staleTime: CACHE_SHORT,
         },
      ),
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
         <MainScrollArea container={false}>
            <div className="container">
               <p className="mb-8 font-semibold text-xl max-lg:hidden">
                  {greeting}, {auth.user.name}
               </p>
               <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                  <Card>
                     <CardHeader>
                        <CardTitle>Профіт</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                           $49,482
                        </p>
                        <CardFooter>За сьогодні</CardFooter>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader>
                        <CardTitle>Профіт</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-mono font-semibold text-2xl text-black tracking-tight md:text-3xl">
                           $49,482
                        </p>
                        <CardFooter>За сьогодні</CardFooter>
                     </CardContent>
                  </Card>
                  <Card className="md:col-span-2 lg:col-span-1">
                     <CardHeader>
                        <CardTitle>Профіт</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                           $49,482
                        </p>
                        <CardFooter>За сьогодні</CardFooter>
                     </CardContent>
                  </Card>
               </div>
               <div className="mt-8 flex items-center justify-between gap-4">
                  <p className="font-semibold text-xl">Замовлення</p>
                  <CreateOrder />
               </div>
            </div>
            <div className="mt-5 mb-16">
               {Object.entries(groupedData).map(([creatorId, data]) => {
                  const creator = data.find(
                     (item) => item.creatorId === creatorId,
                  )?.creator
                  if (!creator) return null

                  return (
                     <div
                        key={creatorId}
                        className="relative"
                     >
                        <div className="border-neutral border-y bg-primary-1 py-2">
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

   return (
      <p
         ref={(el) => {
            if (el) {
               const width = el.getBoundingClientRect().width
               if (!columnWidths[id] || width > columnWidths[id]) {
                  setColumnWidths((prev) => ({
                     ...prev,
                     [id]: width,
                  }))
               }
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
            className="container grid-cols-[1fr_100px_50px] items-start gap-3 py-2.5 text-left transition-colors duration-50 first:border-none hover:bg-primary-1 has-data-[popup-open]:bg-primary-1 aria-expanded:bg-primary-1 max-lg:grid lg:flex lg:gap-4 lg:py-2"
         >
            <AlignedColumn
               id="o_price"
               className="whitespace-nowrap font-medium font-mono max-lg:order-1 max-lg:text-[1rem] lg:mt-1"
            >
               {formatCurrency(item.sellingPrice)}
            </AlignedColumn>
            <AlignedColumn
               id="o_quantity"
               className="col-start-2 col-end-4 whitespace-nowrap font-medium font-mono max-lg:order-2 max-lg:text-right max-lg:text-[1rem] lg:mt-1"
            >
               {formatNumber(item.quantity)} шт.
            </AlignedColumn>
            <p className="col-span-3 max-lg:order-3 max-lg:self-center max-lg:font-medium lg:mt-1">
               {item.name}
            </p>
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
                  className={
                     "col-start-1 mt-1 cursor-pointer justify-self-start max-lg:order-4 lg:mt-px lg:ml-auto"
                  }
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
                        className="col-start-3 shrink-0 justify-self-end max-lg:order-6 max-lg:mt-auto"
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
         </CollapsibleTrigger>
         <CollapsiblePanel
            key={item.procurements.length}
            render={
               <div className="border-neutral border-t bg-primary-2 pt-4 lg:pt-3">
                  <div className="container mb-4">
                     <p
                        className={cx(
                           "mb-4 flex gap-1 font-medium",
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

   return (
      <div className="grid-cols-[1fr_110px_50px] items-start gap-3 border-neutral border-t px-4 py-3 text-left first:border-none max-lg:grid lg:flex lg:gap-4 lg:py-2">
         <AlignedColumn
            id="p_buyer"
            className="col-end-4 flex items-center gap-1.5 justify-self-end whitespace-nowrap max-lg:order-4 max-lg:flex-row-reverse lg:mt-1"
         >
            <UserAvatar
               size={16}
               user={item.buyer}
               className="inline-block align-text-top"
            />
            {item.buyer.name}
         </AlignedColumn>
         <AlignedColumn
            id="p_price"
            className="whitespace-nowrap font-medium font-mono max-lg:order-1 lg:mt-1 lg:text-sm"
         >
            {formatCurrency(item.purchasePrice)}
         </AlignedColumn>
         <AlignedColumn
            id="p_quantity"
            className="col-start-2 col-end-4 whitespace-nowrap font-medium font-mono max-lg:order-2 max-lg:text-right lg:mt-1 lg:text-sm"
         >
            {formatNumber(item.quantity)} шт.
         </AlignedColumn>
         <AlignedColumn
            className="max-lg:order-3 lg:mt-[0.2rem]"
            id="p_status"
         >
            <Combobox
               value={item.status}
               onValueChange={(status) =>
                  update.mutate({
                     id: item.id,
                     workspaceId: params.workspaceId,
                     status: status as never,
                     orderId,
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
         <p className="lg:!max-w-[80ch] col-span-3 break-normal empty:hidden max-lg:order-5 lg:mt-1">
            {item.note}
         </p>
         <p className="col-span-2 col-start-1 whitespace-nowrap font-medium font-mono text-lg max-lg:order-6 max-lg:self-center lg:mt-1 lg:ml-auto lg:text-right lg:text-base">
            <span
               className={cx(
                  "mr-1.5 inline-block size-4.5 rounded-xs align-sub max-md:mb-px",
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
                     className="lg:-mr-2 shrink-0 justify-self-end max-lg:order-6 max-lg:mt-auto"
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
