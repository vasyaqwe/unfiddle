import { useAuth } from "@/auth/hooks"
import { formatCurrency } from "@/currency"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { useEventListener } from "@/interactions/use-event-listener"
import { MainScrollArea } from "@/layout/components/main"
import { formatNumber } from "@/number"
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
   CollapsibleTriggerIcon,
} from "@ledgerblocks/ui/components/collapsible"
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
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@ledgerblocks/ui/components/table"
import { formData, number } from "@ledgerblocks/ui/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

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

   const heads = [
      "Назва",
      "Кількість",
      "Ціна продажу",
      "Комент",
      "Статус",
      "Менеджер",
   ]

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
                        <CardTitle>Зароблено</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                           $49,482
                        </p>
                        <CardFooter>За сьогодні</CardFooter>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader>
                        <CardTitle>Зароблено</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="font-mono font-semibold text-2xl tracking-tight md:text-3xl">
                           $49,482
                        </p>
                        <CardFooter>За сьогодні</CardFooter>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader>
                        <CardTitle>Зароблено</CardTitle>
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
                  <NewOrder />
               </div>
            </div>
            <Table className="mt-8 mb-16">
               <TableHeader>
                  <TableRow>
                     {heads.map((head, idx) => (
                        <TableHead key={idx}>{head}</TableHead>
                     ))}
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {query.data?.map((item) => {
                     const [from, to] = orderStatusGradient(item.status)

                     return (
                        <Collapsible
                           key={item.id}
                           render={
                              <>
                                 <TableRow className="relative">
                                    <TableCell>
                                       <CollapsibleTrigger
                                          className={
                                             "before:-inset-x-1.5 before:-inset-y-0.5 relative isolate before:absolute before:z-[-1] before:rounded-sm before:bg-primary-3 before:opacity-0 before:transition-opacitys before:duration-75 hover:before:opacity-100 aria-expanded:before:opacity-100 max-md:p-1"
                                          }
                                       >
                                          <CollapsibleTriggerIcon />
                                          {item.name}
                                       </CollapsibleTrigger>
                                    </TableCell>
                                    <TableCell className="font-mono">
                                       {formatNumber(item.quantity)}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                       {formatCurrency(item.sellingPrice)}
                                    </TableCell>
                                    <TableCell className="min-w-[170px] whitespace-pre-wrap break-words">
                                       {item.note}
                                    </TableCell>
                                    <TableCell>
                                       <Badge
                                          style={{
                                             background: `linear-gradient(140deg, ${from}, ${to})`,
                                          }}
                                       >
                                          {
                                             ORDER_STATUSES_TRANSLATION[
                                                item.status
                                             ]
                                          }
                                       </Badge>
                                    </TableCell>
                                    <TableCell>
                                       <UserAvatar
                                          size={16}
                                          user={item.creator}
                                          className="mr-1.5 inline-block align-text-top"
                                       />
                                       {item.creator.name}
                                    </TableCell>
                                 </TableRow>
                                 <CollapsiblePanel
                                    keepMounted
                                    render={
                                       <TableRow className="border-primary-2">
                                          <TableCell
                                             colSpan={heads.length}
                                             className="!p-0 bg-primary-1"
                                          >
                                             {item.procurements.length === 0 ? (
                                                <p className="mx-8 mt-4 font-medium text-foreground/80">
                                                   Тут нічого немає.
                                                </p>
                                             ) : (
                                                <Table className="z-[2]">
                                                   <TableBody className="isolate before:absolute before:inset-2 before:z-[-1] before:rounded-xl before:border before:border-neutral before:bg-background before:shadow-md/4">
                                                      {item.procurements.map(
                                                         (item) => (
                                                            <ProcurementRow
                                                               key={item.id}
                                                               item={item}
                                                            />
                                                         ),
                                                      )}
                                                   </TableBody>
                                                </Table>
                                             )}
                                             <NewProcurement
                                                orderName={item.name}
                                                orderId={item.id}
                                                empty={
                                                   item.procurements.length ===
                                                   0
                                                }
                                             />
                                          </TableCell>
                                       </TableRow>
                                    }
                                 />
                              </>
                           }
                        />
                     )
                  })}
               </TableBody>
            </Table>
         </MainScrollArea>
      </>
   )
}

function NewOrder() {
   const queryClient = useQueryClient()
   const params = Route.useParams()
   const [open, setOpen] = React.useState(false)
   const mutation = useMutation(
      trpc.order.create.mutationOptions({
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
               <Button>
                  <Icons.plus /> Додати
               </Button>
            }
         />
         <DrawerPopup>
            <DrawerTitle>Нове замовлення</DrawerTitle>
            <form
               className="mt-4 flex grow flex-col space-y-7"
               onSubmit={(e) => {
                  e.preventDefault()
                  const form = formData<{
                     name: string
                     quantity: string
                     sellingPrice: string
                     note: string
                  }>(e.target)

                  mutation.mutate({
                     workspaceId: params.workspaceId,
                     name: form.name,
                     quantity: number(form.quantity),
                     sellingPrice: number(form.sellingPrice),
                     note: form.note,
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
                     <FieldLabel>Ціна продажу</FieldLabel>
                     <NumberField
                        required
                        name="sellingPrice"
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
                     className="mx-8 my-5"
                  >
                     <Icons.plus /> Нова закупівля
                  </Button>
               ) : (
                  <button className="-translate-y-2 -mt-2 mx-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-b-xl bg-primary-3/60 py-2.5 pt-4 transition-colors duration-75 hover:bg-primary-3">
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

function ProcurementRow({
   item,
}: { item: RouterOutput["order"]["list"][number]["procurements"][number] }) {
   const [from, to] = procurementStatusGradient(item.status)

   return (
      <TableRow className="relative overflow-hidden border-none after:absolute after:inset-x-[0.3rem] after:bottom-0 after:z-[2] after:h-px after:w-[calc(100%-0.6rem)] after:border-neutral after:border-b last:after:hidden first:[&>td]:pt-5 last:[&>td]:pb-5 md:last:[&>td]:pb-4 md:first:[&>td]:pt-4">
         <TableCell className="max-md:!pl-6 w-[100px]">
            <UserAvatar
               size={16}
               user={item.buyer}
               className="mr-1.5 inline-block align-text-top"
            />
            {item.buyer.name}
         </TableCell>
         <TableCell className="w-[50px] font-mono">
            {formatNumber(item.quantity)} шт.
         </TableCell>
         <TableCell className="w-[50px] font-mono">
            {formatCurrency(item.purchasePrice)}
         </TableCell>
         <TableCell className="w-[100px]">
            <Badge
               style={{
                  background: `linear-gradient(140deg, ${from}, ${to})`,
               }}
            >
               {PROCUREMENT_STATUSES_TRANSLATION[item.status]}
            </Badge>
         </TableCell>
         <TableCell>{item.note}</TableCell>
      </TableRow>
   )
}
