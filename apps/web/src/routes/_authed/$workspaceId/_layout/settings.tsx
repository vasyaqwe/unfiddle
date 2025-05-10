import { api } from "@/api"
import { useAuth } from "@/auth/hooks"
import { fileToBase64, imageDimensions } from "@/file/utils"
import { MainScrollArea } from "@/layout/components/main"
import { useOrderQueryOptions } from "@/order/queries"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/routes/_authed/$workspaceId/-components/header"
import { trpc } from "@/trpc"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import {
   Field,
   FieldControl,
   FieldLabel,
} from "@ledgerblocks/ui/components/field"
import { FileTrigger } from "@ledgerblocks/ui/components/file-trigger"
import {
   Tabs,
   TabsList,
   TabsPanel,
   TabsTab,
} from "@ledgerblocks/ui/components/tabs"
import { formData } from "@ledgerblocks/ui/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { z } from "zod"

const TABS = ["workspace", "me"] as const

export const Route = createFileRoute("/_authed/$workspaceId/_layout/settings")({
   component: RouteComponent,
   validateSearch: validator(
      z.object({
         tab: z.enum(TABS).catch("workspace"),
      }),
   ),
})

function RouteComponent() {
   const search = Route.useSearch()
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const auth = useAuth()
   const orderQueryOptions = useOrderQueryOptions()

   const updateWorkspace = useMutation(
      trpc.workspace.update.mutationOptions({
         onSuccess: () => {
            toast.success("Оновлено")
            queryClient.invalidateQueries(auth.queryOptions.workspace)
         },
      }),
   )

   const updateUser = useMutation(
      trpc.user.update.mutationOptions({
         onSuccess: () => {
            toast.success("Оновлено")
            queryClient.invalidateQueries(auth.queryOptions.user)
            queryClient.invalidateQueries(orderQueryOptions.list)
            queryClient.invalidateQueries(
               trpc.workspace.member.list.queryOptions({
                  workspaceId: auth.workspace.id,
               }),
            )
         },
      }),
   )

   const upload = useMutation({
      mutationFn: async (file: File) => {
         const { width, height } = await imageDimensions(file)
         const json = {
            name: file.name,
            type: file.type,
            size: file.size,
            width,
            height,
            base64: await fileToBase64(file),
         }
         return await api.storage.$post({
            json: { files: [json] },
         })
      },
      onError: () => undefined,
   })

   return (
      <>
         <Header>
            <HeaderBackButton />
            <HeaderTitle>Налаштування</HeaderTitle>
         </Header>
         <MainScrollArea>
            <div className="mb-8 flex items-center justify-between max-md:hidden">
               <p className="font-semibold text-xl">Налаштування</p>
            </div>
            <Tabs
               value={search.tab}
               onValueChange={(tab) =>
                  navigate({ to: ".", search: { tab }, replace: true })
               }
            >
               <TabsList>
                  {TABS.map((tab) => (
                     <TabsTab
                        key={tab}
                        value={tab}
                     >
                        {tab === "me" ? "Профіль" : "Проєкт"}
                     </TabsTab>
                  ))}
               </TabsList>
               <TabsPanel
                  className={"mt-3"}
                  value={"workspace"}
               >
                  <form
                     onSubmit={(e) => {
                        e.preventDefault()
                        const form = formData<{ name: string }>(e.target)
                        if (auth.workspace.name === form.name) return
                        updateWorkspace.mutate({
                           id: auth.workspace.id,
                           name: form.name,
                        })
                     }}
                     className="divide-y divide-neutral"
                  >
                     <div className="grid grid-cols-[100px_1fr] items-center py-4">
                        <label htmlFor="logo">Логотип</label>
                        <FileTrigger
                           disabled={
                              upload.isPending || updateWorkspace.isPending
                           }
                           id="logo"
                           kind={"icon"}
                           variant={"ghost"}
                           onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return

                              const res = await upload.mutateAsync(file)
                              const data = await res.json()
                              const image = data.uploaded[0]
                              if (
                                 data.uploaded.some((r) => "error" in r) ||
                                 !image
                              )
                                 return toast.error("Ой-ой!", {
                                    description:
                                       "Не вдалося завантажити логотип",
                                 })

                              updateWorkspace.mutate({
                                 id: auth.workspace.id,
                                 image: image.url,
                              })
                           }}
                           size={"xl"}
                        >
                           <WorkspaceLogo
                              size={32}
                              workspace={auth.workspace}
                           />
                        </FileTrigger>
                     </div>
                     <Field className="grid grid-cols-[100px_1fr] items-center py-4">
                        <FieldLabel className="mt-2 md:mt-1">Назва</FieldLabel>
                        <FieldControl
                           className={"max-w-[300px]"}
                           defaultValue={auth.workspace.name}
                           placeholder="Уведіть назву"
                           name="name"
                           onBlur={(e) => {
                              if (auth.workspace.name === e.target.value) return
                              updateWorkspace.mutate({
                                 id: auth.workspace.id,
                                 name: e.target.value,
                              })
                           }}
                        />
                     </Field>
                  </form>
               </TabsPanel>
               <TabsPanel
                  className={"mt-3"}
                  value={"me"}
               >
                  <form
                     onSubmit={(e) => {
                        e.preventDefault()
                        const form = formData<{ name: string }>(e.target)
                        if (auth.user.name === form.name) return
                        updateUser.mutate({
                           name: form.name,
                        })
                     }}
                     className="divide-y divide-neutral"
                  >
                     <div className="grid grid-cols-[100px_1fr] items-center py-4">
                        <label htmlFor="logo">Аватар</label>
                        <FileTrigger
                           disabled={upload.isPending || updateUser.isPending}
                           id="logo"
                           kind={"icon"}
                           variant={"ghost"}
                           onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return

                              const res = await upload.mutateAsync(file)
                              const data = await res.json()
                              const image = data.uploaded[0]
                              if (
                                 data.uploaded.some((r) => "error" in r) ||
                                 !image
                              )
                                 return toast.error("Ой-ой!", {
                                    description:
                                       "Не вдалося завантажити логотип",
                                 })

                              updateUser.mutate({
                                 image: image.url,
                              })
                           }}
                           size={"xl"}
                        >
                           <UserAvatar
                              size={32}
                              user={auth.user}
                           />
                        </FileTrigger>
                     </div>
                     <Field className="grid grid-cols-[100px_1fr] items-center py-4">
                        <FieldLabel className="mt-2 md:mt-1">Ім'я</FieldLabel>
                        <FieldControl
                           className={"max-w-[300px]"}
                           defaultValue={auth.user.name}
                           placeholder="Уведіть ваше ім'я"
                           name="name"
                           onBlur={(e) => {
                              if (auth.user.name === e.target.value) return
                              updateUser.mutate({
                                 name: e.target.value,
                              })
                           }}
                        />
                     </Field>
                  </form>
               </TabsPanel>
            </Tabs>
         </MainScrollArea>
      </>
   )
}
