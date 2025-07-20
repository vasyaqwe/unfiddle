import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useDelayedValue } from "@/interactions/use-delayed-value"
import { MainScrollArea } from "@/layout/components/main"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { ErrorComponent } from "@/ui/components/error"
import { UserAvatar } from "@/user/components/user-avatar"
import { WORKSPACE_ROLES_TRANSLATION } from "@/workspace/constants"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { formatDate } from "@unfiddle/core/date"
import type { RouterOutput } from "@unfiddle/core/trpc/types"
import { WORKSPACE_ROLES } from "@unfiddle/core/workspace/constants"
import { Button } from "@unfiddle/ui/components/button"
import { CopyButton } from "@unfiddle/ui/components/copy-button"
import {
   Dialog,
   DialogPopup,
   DialogTitle,
   DialogTrigger,
   DialogXClose,
} from "@unfiddle/ui/components/dialog"
import {
   AlertDialog,
   AlertDialogClose,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogPopup,
   AlertDialogTitle,
} from "@unfiddle/ui/components/dialog/alert"
import { Icons } from "@unfiddle/ui/components/icons"
import { Input } from "@unfiddle/ui/components/input"
import { Loading } from "@unfiddle/ui/components/loading"
import {
   Menu,
   MenuItem,
   MenuPopup,
   MenuTrigger,
} from "@unfiddle/ui/components/menu"
import {
   Select,
   SelectItem,
   SelectPopup,
   SelectTrigger,
   SelectValue,
} from "@unfiddle/ui/components/select"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@unfiddle/ui/components/table"
import * as React from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/_authed/$workspaceId/_layout/team")({
   component: RouteComponent,
   loader: async (opts) => {
      opts.context.queryClient.prefetchQuery(
         trpc.workspace.member.list.queryOptions(opts.params),
      )
   },
})

function RouteComponent() {
   const params = Route.useParams()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const query = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )

   const inputRef = React.useRef<HTMLInputElement>(null)
   const joinLink = `${env.WEB_URL}/join/${auth.workspace?.inviteCode}`

   const [inviteOpen, setInviteOpen] = React.useState(false)

   const createCode = useMutation(
      trpc.workspace.createCode.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries(auth.queryOptions.workspace)
         },
      }),
   )

   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Команда</HeaderTitle>
            <Dialog
               open={inviteOpen}
               onOpenChange={setInviteOpen}
            >
               {auth.workspace.role === "owner" ||
               auth.workspace.role === "admin" ? (
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
               ) : null}
               <DialogPopup>
                  <DialogTitle>
                     Запросіть людей
                     <DialogXClose />
                  </DialogTitle>
                  <p className="text-foreground/75">
                     Будь-хто може приєднатися до проєкту за цим посиланням.
                  </p>
                  <div className="relative mt-4 flex items-center gap-0.5">
                     <Input
                        readOnly
                        ref={inputRef}
                        value={joinLink}
                        className={"mr-1 truncate"}
                     />
                     <CopyButton
                        value={joinLink}
                        size={"lg"}
                     />
                     <Button
                        disabled={createCode.isPending}
                        onClick={() =>
                           createCode.mutate({ id: auth.workspace.id })
                        }
                        size={"lg"}
                        kind={"icon"}
                        variant={"ghost"}
                     >
                        <Icons.reload className="size-5" />
                     </Button>
                  </div>
               </DialogPopup>
            </Dialog>
         </Header>
         <MainScrollArea container={false}>
            <div className="container mb-8 flex items-center justify-between max-md:hidden">
               <p className="font-semibold text-xl">Команда</p>
               {auth.workspace.role === "owner" ||
               auth.workspace.role === "admin" ? (
                  <Button onClick={() => setInviteOpen(true)}>Запросити</Button>
               ) : null}
            </div>
            {query.isPending ? (
               <Loading
                  size={"xl"}
                  className="mx-auto mt-40"
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
                        {auth.workspace.role === "owner" ? <TableHead /> : null}
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {query.data?.map((member) => (
                        <MemberRow
                           key={member.user.id}
                           member={member}
                        />
                     ))}
                  </TableBody>
               </Table>
            )}
         </MainScrollArea>
      </>
   )
}

function MemberRow({
   member,
}: { member: RouterOutput["workspace"]["member"]["list"][number] }) {
   const params = Route.useParams()
   const queryClient = useQueryClient()
   const auth = useAuth()

   const [deleteOpen, setDeleteOpen] = React.useState(false)
   const menuTriggerRef = React.useRef<HTMLButtonElement>(null)

   const update = useMutation(
      trpc.workspace.member.update.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries(
               trpc.workspace.member.list.queryOptions({
                  workspaceId: params.workspaceId,
               }),
            )
         },
      }),
   )

   const deleteMember = useMutation(
      trpc.workspace.member.delete.mutationOptions({
         onSuccess: () => {
            toast.success("Успішно видалено")
            queryClient.invalidateQueries(
               trpc.workspace.member.list.queryOptions({
                  workspaceId: params.workspaceId,
               }),
            )
            queryClient.invalidateQueries(
               trpc.order.list.queryOptions({
                  filter: {},
                  workspaceId: params.workspaceId,
               }),
            )
         },
      }),
   )

   const isDeletePending = useDelayedValue(deleteMember.isPending, 150)

   return (
      <>
         <TableRow>
            <TableCell>
               <div className="flex items-center gap-1.5">
                  <UserAvatar
                     size={24}
                     className="-mt-px"
                     user={member.user}
                  />
                  {member.user.name}
               </div>
            </TableCell>
            <TableCell>{member.user.email}</TableCell>
            <TableCell className="min-w-[150px]">
               <Select
                  value={member.role}
                  onValueChange={(role) =>
                     update.mutate({
                        userId: member.user.id,
                        workspaceId: params.workspaceId,
                        role,
                     })
                  }
               >
                  <SelectTrigger
                     disabled={
                        member.user.id === auth.user.id || // Can't change own role
                        (member.role === "owner" &&
                           auth.workspace.role !== "owner") || // Only owners can modify owner roles
                        auth.workspace.role === "manager" ||
                        auth.workspace.role === "buyer"
                     }
                     render={
                        <Button
                           variant={"ghost"}
                           className="-ml-2 disabled:cursor-auto disabled:opacity-100 disabled:hover:bg-transparent"
                        >
                           <SelectValue>{(label) => label}</SelectValue>
                        </Button>
                     }
                  />
                  <SelectPopup>
                     {WORKSPACE_ROLES.map((role) => {
                        return (
                           <SelectItem
                              key={role}
                              value={role}
                              disabled={
                                 role === "owner" &&
                                 auth.workspace.role !== "owner"
                              }
                              className={
                                 "data-disabled:cursor-not-allowed data-disabled:opacity-70 data-disabled:hover:bg-transparent"
                              }
                           >
                              {WORKSPACE_ROLES_TRANSLATION[role]}
                           </SelectItem>
                        )
                     })}
                  </SelectPopup>
               </Select>
            </TableCell>
            <TableCell>
               {formatDate(member.createdAt, {
                  month: "long",
                  day: "numeric",
               })}
            </TableCell>
            {auth.workspace.role === "owner" &&
            member.user.id !== auth.user.id ? (
               <TableCell>
                  <Menu>
                     <MenuTrigger
                        ref={menuTriggerRef}
                        render={
                           <Button
                              variant={"ghost"}
                              kind={"icon"}
                           >
                              <Icons.ellipsisHorizontal />
                           </Button>
                        }
                     />
                     <MenuPopup align="end">
                        <MenuItem
                           destructive
                           onClick={() => setDeleteOpen(true)}
                        >
                           <Icons.trash />
                           Видалити
                        </MenuItem>
                     </MenuPopup>
                  </Menu>
               </TableCell>
            ) : null}
         </TableRow>
         <AlertDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
         >
            <AlertDialogPopup finalFocus={menuTriggerRef}>
               <AlertDialogTitle>
                  Видалити {member.user.name} з команди?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  <b>
                     {member.user.name} ({member.user.email})
                  </b>{" "}
                  більше не буде мати доступу до проєкту. Усі дані від цього
                  користувача залишаться незмінними (замовлення, закупівлі).
               </AlertDialogDescription>
               <AlertDialogFooter>
                  <AlertDialogClose
                     render={<Button variant="secondary">Відмінити</Button>}
                  />
                  <AlertDialogClose
                     render={
                        <Button
                           disabled={isDeletePending}
                           pending={isDeletePending}
                           variant={"destructive"}
                           onClick={() =>
                              deleteMember.mutate({
                                 id: member.user.id,
                                 workspaceId: params.workspaceId,
                              })
                           }
                        >
                           Так, видалити
                        </Button>
                     }
                  />
               </AlertDialogFooter>
            </AlertDialogPopup>
         </AlertDialog>
      </>
   )
}
