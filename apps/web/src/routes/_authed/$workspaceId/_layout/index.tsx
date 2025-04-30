import { useAuth } from "@/auth/hooks"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { useEventListener } from "@/interactions/use-event-listener"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderTitle,
   HeaderUserMenu,
   HeaderWorkspaceMenu,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { Button } from "@ledgerblocks/ui/components/button"
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@ledgerblocks/ui/components/card"
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

   return (
      <>
         <Header>
            <HeaderWorkspaceMenu />
            <HeaderTitle className="line-clamp-1">
               {auth.workspace.name}
            </HeaderTitle>
            <HeaderUserMenu />
         </Header>
         <MainScrollArea>
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
            <div className="mt-8 flex items-center justify-end gap-4">
               <NewOrder />
            </div>
            <div className="mt-8">
               {query.data?.map((item) => item.quantity)}
            </div>
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
            mutation.reset
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
                  <Icons.plus /> Замовлення
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
