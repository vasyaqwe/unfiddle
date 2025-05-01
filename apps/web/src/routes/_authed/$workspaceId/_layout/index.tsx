import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { useEventListener } from "@/interactions/use-event-listener"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
import { CreateOrder } from "@/order/components/create-order"
import { ORDER_STATUSES_TRANSLATION } from "@/order/constants"
import { orderStatusGradient } from "@/order/utils"
import { PROCUREMENT_STATUSES_TRANSLATION } from "@/procurement/constants"
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
import {
   Drawer,
   DrawerPopup,
   DrawerTitle,
   DrawerTrigger,
} from "@ledgerblocks/ui/components/drawer"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import { Icons } from "@ledgerblocks/ui/components/icons"
import {
   NumberField,
   NumberFieldInput,
} from "@ledgerblocks/ui/components/number-field"
import { cn, formData, number } from "@ledgerblocks/ui/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
         <MainScrollArea container={false}>
            <div className="container">
               <p className="mb-8 font-semibold text-xl max-md:hidden">
                  {greeting}, {auth.user.name}
               </p>
               <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
                  <Card>
                     <CardHeader>
                        <CardTitle>Профіт</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-medium font-mono text-2xl text-black tracking-tight md:text-3xl">
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
                        <p className="font-medium font-mono text-2xl text-black tracking-tight md:text-3xl">
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
                        <p className="font-medium font-mono text-2xl tracking-tight md:text-3xl">
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
                           <div className="px-4 md:px-8">
                              <p className="font-semibold">
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
                              "divide-y divide-neutral md:divide-neutral/50"
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
            "max-md:![--min-width:auto] min-w-(--min-width)",
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
   const [states, setStates] = useAtom(collapsiblesStateAtom)
   const [from, to] = orderStatusGradient(item.status)

   const open = states[item.id] ?? false
   const setOpen = (open: boolean) => {
      setStates({
         ...states,
         [item.id]: open,
      })
   }

   return (
      <Collapsible
         open={open}
         onOpenChange={setOpen}
      >
         <CollapsibleTrigger className="container grid-cols-2 items-start gap-3 border-neutral py-2.5 text-left transition-colors duration-50 first:border-none hover:bg-primary-1 aria-expanded:bg-primary-1 max-md:grid max-md:border-t md:flex md:gap-4 md:py-2">
            <AlignedColumn
               id="price"
               className="max-md:order-1 max-md:font-medium max-md:text-[1rem] md:mt-1"
            >
               {formatCurrency(item.sellingPrice)}
            </AlignedColumn>
            <AlignedColumn
               id="quantity"
               className="max-md:order-2 max-md:text-right max-md:font-medium max-md:text-[1rem] md:mt-1"
            >
               {formatNumber(item.quantity)} шт.
            </AlignedColumn>
            <AlignedColumn
               id="name"
               className="max-md:order-3 max-md:self-center max-md:font-medium md:mt-1"
            >
               {item.name}
            </AlignedColumn>
            <p className="col-span-2 empty:hidden max-md:order-5 md:mt-1">
               {item.note}
            </p>
            <Combobox value={item.status}>
               <ComboboxTrigger
                  onClick={(e) => {
                     e.stopPropagation()
                  }}
                  className={"ml-auto cursor-pointer max-md:order-4"}
               >
                  <Badge
                     style={{
                        background: `linear-gradient(140deg, ${from}, ${to})`,
                     }}
                  >
                     {ORDER_STATUSES_TRANSLATION[item.status]}
                  </Badge>
               </ComboboxTrigger>
               <ComboboxPopup align="end">
                  <ComboboxInput />
                  {ORDER_STATUSES.map((s) => (
                     <ComboboxItem
                        key={s}
                        value={ORDER_STATUSES_TRANSLATION[s]}
                     >
                        {ORDER_STATUSES_TRANSLATION[s]}
                     </ComboboxItem>
                  ))}
               </ComboboxPopup>
            </Combobox>
         </CollapsibleTrigger>
         <CollapsiblePanel
            key={item.procurements.length}
            render={
               <div className="bg-primary-1">
                  <div className="container mt-1 mb-3">
                     {item.procurements.length === 0 ? (
                        <p className="mt-4 font-medium text-foreground/80">
                           Тут нічого немає.
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
                     <NewProcurement
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
   const [from, to] = procurementStatusGradient(item.status)

   return (
      <div className="grid-cols-2 items-start gap-3 border-neutral border-t px-4 py-3 text-left first:border-none max-md:grid md:flex md:gap-4 md:py-3.5">
         <AlignedColumn
            id="buyer"
            className="max-md:order-3"
         >
            <UserAvatar
               size={16}
               user={item.buyer}
               className="mr-1.5 inline-block align-text-top"
            />
            {item.buyer.name}
         </AlignedColumn>
         <AlignedColumn
            id="quantity"
            className="max-md:order-1 max-md:font-medium md:text-sm"
         >
            {formatNumber(item.quantity)} шт.
         </AlignedColumn>
         <AlignedColumn
            id="price"
            className="max-md:order-2 max-md:font-medium md:text-sm"
         >
            {formatCurrency(item.purchasePrice)}
         </AlignedColumn>
         <AlignedColumn
            className="max-md:order-4"
            id="status"
         >
            <Badge
               size={"sm"}
               style={{
                  background: `linear-gradient(140deg, ${from}, ${to})`,
               }}
            >
               {PROCUREMENT_STATUSES_TRANSLATION[item.status]}
            </Badge>
         </AlignedColumn>
         <p className="empty:hidden max-md:order-5">{item.note}</p>
         <p className="col-span-2 font-medium text-lg max-md:order-6 md:ml-auto md:text-right md:text-base">
            {formatCurrency(
               (sellingPrice - item.purchasePrice) * item.quantity,
            )}{" "}
            профіт
         </p>
      </div>
   )
}

function NewProcurement({
   orderName,
   orderId,
   empty,
}: { orderName: string; orderId: string; empty: boolean }) {
   const queryClient = useQueryClient()
   const params = Route.useParams()
   const [open, setOpen] = React.useState(false)
   const mutation = useMutation(
      trpc.procurement.create.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries(
               trpc.order.list.queryOptions({
                  workspaceId: params.workspaceId,
               }),
            )
            setOpen(false)
         },
      }),
   )

   const pending = useDelayedValue(mutation.isPending, 150)

   return (
      <Drawer
         open={open}
         onOpenChange={setOpen}
      >
         <DrawerTrigger
            render={
               empty ? (
                  <Button
                     variant={"secondary"}
                     className="my-5"
                  >
                     <Icons.plus />
                     Додати
                  </Button>
               ) : (
                  <button className="-mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-b-lg bg-primary-3/60 py-2.5 pt-4 transition-colors duration-75 hover:bg-primary-3">
                     <Icons.plus /> Додати
                  </button>
               )
            }
         />
         <DrawerPopup>
            <DrawerTitle>Нова закупівля</DrawerTitle>
            <form
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{
                     quantity: string
                     purchasePrice: string
                     note: string
                  }>(e.target)

                  mutation.mutate({
                     orderId,
                     workspaceId: params.workspaceId,
                     quantity: number(form.quantity),
                     purchasePrice: number(form.purchasePrice),
                     note: form.note,
                  })
               }}
            >
               <Field>
                  <FieldLabel>Замовлення</FieldLabel>
                  <FieldControl
                     defaultValue={orderName}
                     readOnly
                     disabled
                  />
               </Field>
               <div className="grid grid-cols-2 gap-3">
                  <Field>
                     <FieldLabel>Кількість</FieldLabel>
                     <NumberField
                        required
                        name="quantity"
                        min={1}
                     >
                        <NumberFieldInput placeholder="шт." />
                     </NumberField>
                  </Field>
                  <Field>
                     <FieldLabel>Ціна</FieldLabel>
                     <NumberField
                        required
                        name="purchasePrice"
                        min={1}
                     >
                        <NumberFieldInput placeholder="₴" />
                     </NumberField>
                  </Field>
               </div>
               <Field>
                  <FieldLabel>Комент</FieldLabel>
                  <FieldControl
                     name="note"
                     placeholder="Додайте комент"
                  />
               </Field>
               <Button
                  pending={pending}
                  disabled={pending}
                  className="mt-auto md:mr-auto"
               >
                  Додати
               </Button>
            </form>
         </DrawerPopup>
      </Drawer>
   )
}
