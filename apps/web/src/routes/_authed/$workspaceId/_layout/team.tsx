import { useAuth } from "@/auth/hooks"
import { formatDate } from "@/date"
import { env } from "@/env"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { UserAvatar } from "@/user/components/user-avatar"
import { Button } from "@ledgerblocks/ui/components/button"
import { CopyButton } from "@ledgerblocks/ui/components/copy-button"
import {
   Dialog,
   DialogPopup,
   DialogTitle,
   DialogTrigger,
   DialogXClose,
} from "@ledgerblocks/ui/components/dialog"
import { Icons } from "@ledgerblocks/ui/components/icons"
import { Input } from "@ledgerblocks/ui/components/input"
import { Loading } from "@ledgerblocks/ui/components/loading"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@ledgerblocks/ui/components/table"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/team")({
   component: RouteComponent,
   loader: async ({ context, params }) => {
      context.queryClient.prefetchQuery(
         trpc.workspace.members.queryOptions({
            workspaceId: params.workspaceId,
         }),
      )
   },
})

function RouteComponent() {
   const params = Route.useParams()
   const auth = useAuth()
   const query = useQuery(
      trpc.workspace.members.queryOptions({ workspaceId: params.workspaceId }),
   )

   const inputRef = React.useRef<HTMLInputElement>(null)

   const joinLink = `${env.WEB_URL}/join/${auth.workspace?.inviteCode}`

   return (
      <Dialog>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Команда</HeaderTitle>
            <DialogTrigger
               render={
                  <Button
                     className="ml-auto"
                     variant={"ghost"}
                     kind={"icon"}
                     aria-label="Запросити"
                  >
                     <Icons.plus />
                  </Button>
               }
            />
         </Header>
         <MainScrollArea container={false}>
            <div className="container mb-8 flex items-center justify-between max-md:hidden">
               <p className="font-semibold text-xl">Команда</p>
               <DialogTrigger render={<Button>Запросити</Button>} />
            </div>
            {query.isPending ? (
               <Loading
                  size={"xl"}
                  className="-translate-y-12 md:-translate-y-20 m-auto"
               />
            ) : query.isError ? (
               <ErrorComponent error={query.error} />
            ) : (
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Ім'я</TableHead>
                        <TableHead>Пошта</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Приєднався</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {query.data?.map((member) => {
                        return (
                           <TableRow key={member.user.id}>
                              <TableCell>
                                 <div className="flex items-center gap-1.5">
                                    <UserAvatar
                                       className="-mt-px"
                                       user={member.user}
                                    />
                                    {member.user.name}
                                 </div>
                              </TableCell>
                              <TableCell>{member.user.email}</TableCell>
                              <TableCell>
                                 {member.role === "admin" ? "Адмін" : "Член"}
                              </TableCell>
                              <TableCell>
                                 {formatDate(member.createdAt, {
                                    month: "long",
                                    day: "numeric",
                                 })}
                              </TableCell>
                           </TableRow>
                        )
                     })}
                  </TableBody>
               </Table>
            )}
         </MainScrollArea>
         <DialogPopup>
            <DialogTitle>
               Запросіть людей
               <DialogXClose />
            </DialogTitle>
            <p className="text-foreground/75">
               Будь-хто може приєднатися до проєкту за цим посиланням.
            </p>
            <div className="relative mt-4 flex items-center gap-1.5">
               <Input
                  readOnly
                  ref={inputRef}
                  value={joinLink}
                  className={"truncate"}
               />
               <CopyButton
                  value={joinLink}
                  size={"lg"}
               />
            </div>
         </DialogPopup>
      </Dialog>
   )
}
