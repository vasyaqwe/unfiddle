import { api } from "@/api"
import { authClient } from "@/auth"
import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { fileToBase64, imageDimensions } from "@/file/components/uploader/utils"
import {
   Header,
   HeaderBackButton,
   HeaderTitle,
} from "@/layout/components/header"
import { MainScrollArea } from "@/layout/components/main"
import { useOrderQueryOptions } from "@/order/queries"
import { trpc } from "@/trpc"
import { UserAvatar } from "@/user/components/user-avatar"
import { validator } from "@/validator"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Field, FieldControl, FieldLabel } from "@unfiddle/ui/components/field"
import { FileTrigger } from "@unfiddle/ui/components/file-trigger"
import { Icons } from "@unfiddle/ui/components/icons"
import {
   Tabs,
   TabsList,
   TabsPanel,
   TabsTab,
} from "@unfiddle/ui/components/tabs"
import { formData } from "@unfiddle/ui/utils"
import { useTheme } from "next-themes"
import React from "react"
import { toast } from "sonner"
import { z } from "zod"

const TABS = ["general", "workspace", "me"] as const

export const Route = createFileRoute("/_authed/$workspaceId/_layout/settings")({
   component: RouteComponent,
   validateSearch: validator(
      z.object({
         tab: z.enum(TABS).catch("general"),
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

   const updateUser = useMutation({
      mutationFn: async (input: { name: string; image: string }) => {
         const res = await authClient.updateUser(input)
         if (res.error) throw res.error
      },
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
   })
   const changeEmail = useMutation({
      mutationFn: async (input: { newEmail: string }) => {
         const res = await authClient.changeEmail({
            ...input,
            callbackURL: env.WEB_URL,
         })
         if (res.error) throw res.error
      },
      onSuccess: () => {
         toast.success("Підтвердження надіслано", {
            description:
               "Перейдіть за посиланням у поточній пошті щоб підтвердити зміну пошти.",
         })
         queryClient.invalidateQueries(auth.queryOptions.user)
         queryClient.invalidateQueries(
            trpc.workspace.member.list.queryOptions({
               workspaceId: auth.workspace.id,
            }),
         )
      },
   })

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

   const theme = useTheme()

   const exportEmails = [
      "luts@lightforce.com.ua",
      "safonov@lightforce.com.ua",
      "vasylpolishchuk22@gmail.com",
   ]

   const [nameFocused, setNameFocused] = React.useState(false)
   const [name, setName] = React.useState(auth.user.name)
   const [emailFocused, setEmailFocused] = React.useState(false)
   const [email, setEmail] = React.useState(auth.user.email)

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
                        {tab === "me"
                           ? "Профіль"
                           : tab === "general"
                             ? "Загальні"
                             : "Проєкт"}
                     </TabsTab>
                  ))}
               </TabsList>
               <TabsPanel
                  className={"mt-3"}
                  value={"general"}
               >
                  <div className="grid grid-cols-[100px_1fr] items-center py-4">
                     <p>Тема</p>
                     <Button
                        className="w-fit"
                        onClick={() =>
                           theme.setTheme(
                              theme.resolvedTheme === "light"
                                 ? "dark"
                                 : "light",
                           )
                        }
                        variant={"ghost"}
                     >
                        {theme.resolvedTheme === "light" ? (
                           <>
                              <svg
                                 className="!ml-0 mr-1 size-[18px]"
                                 viewBox="0 0 14 14"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                              >
                                 <path
                                    d="M7.43652 1.03101C7.43652 0.789378 7.24064 0.593506 6.99902 0.593506C6.75741 0.593506 6.56152 0.789378 6.56152 1.03101V1.91957C6.56152 2.1612 6.75741 2.35707 6.99902 2.35707C7.24064 2.35707 7.43652 2.1612 7.43652 1.91957V1.03101Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M2.46896 10.9115C2.29811 11.0823 2.29811 11.3594 2.46896 11.5302C2.63982 11.7011 2.91682 11.7011 3.08768 11.5302L3.71599 10.9019C3.88684 10.7311 3.88684 10.454 3.71599 10.2832C3.54514 10.1123 3.26812 10.1123 3.09727 10.2832L2.46896 10.9115Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M6.99902 11.6431C7.24064 11.6431 7.43652 11.8389 7.43652 12.0806V12.9692C7.43652 13.2108 7.24064 13.4067 6.99902 13.4067C6.75741 13.4067 6.56152 13.2108 6.56152 12.0806C6.56152 11.8389 6.75741 11.6431 6.99902 11.6431Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M10.282 3.09849C10.1111 3.26935 10.1111 3.54635 10.282 3.71721C10.4528 3.88807 10.7298 3.88807 10.9007 3.71721L11.529 3.0889C11.6999 2.91805 11.6999 2.64103 11.529 2.47018C11.3581 2.29933 11.0811 2.29933 10.9103 2.47018L10.282 3.09849Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M11.6416 7C11.6416 6.75838 11.8375 6.5625 12.0791 6.5625H12.9677C13.2093 6.5625 13.4052 6.75838 13.4052 7C13.4052 7.24167 13.2093 7.4375 12.9677 7.4375H12.0791C11.8375 7.4375 11.6416 7.24167 11.6416 7Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M10.9007 10.2832C10.7298 10.1123 10.4528 10.1123 10.282 10.2832C10.1111 10.454 10.1111 10.7311 10.282 10.9019L10.9103 11.5302C11.0811 11.7011 11.3581 11.7011 11.529 11.5302C11.6999 11.3594 11.6999 11.0823 11.529 10.9115L10.9007 10.2832Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M0.592285 7C0.592285 6.75838 0.788163 6.5625 1.02979 6.5625H1.91835C2.15998 6.5625 2.35585 6.75838 2.35585 7C2.35585 7.24162 2.15998 7.4375 1.91835 7.4375H1.02979C0.788163 7.4375 0.592285 7.24162 0.592285 7Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M3.08768 2.47018C2.91682 2.29933 2.63982 2.29933 2.46896 2.47018C2.29811 2.64103 2.29811 2.91805 2.46896 3.0889L3.09727 3.71721C3.26813 3.88807 3.54514 3.88807 3.71599 3.71721C3.88685 3.54635 3.88685 3.26935 3.71599 3.09849L3.08768 2.47018Z"
                                    fill="currentColor"
                                 />
                                 <path
                                    d="M4.52415 4.52513C5.89096 3.15829 8.10704 3.15829 9.47391 4.52513C10.8407 5.89196 10.8407 8.10804 9.47391 9.47485C8.10704 10.8417 5.89096 10.8417 4.52415 9.47485C3.15732 8.10804 3.15732 5.89196 4.52415 4.52513Z"
                                    fill="currentColor"
                                 />
                              </svg>
                              Світла
                           </>
                        ) : (
                           <>
                              {" "}
                              <svg
                                 className="!ml-0 mr-1 size-[18px]"
                                 viewBox="0 0 14 14"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                              >
                                 <path
                                    d="M6.99984 1.16675C3.77817 1.16675 1.1665 3.77842 1.1665 7.00008C1.1665 10.2217 3.77817 12.8334 6.99984 12.8334C10.2215 12.8334 12.8332 10.2217 12.8332 7.00008C12.8332 6.96036 12.8328 6.92069 12.832 6.8812C12.8287 6.71926 12.7363 6.57244 12.5918 6.49941C12.4472 6.42643 12.2742 6.43921 12.142 6.53272C11.5956 6.919 10.9291 7.14592 10.2082 7.14592C8.35574 7.14592 6.854 5.64421 6.854 3.79175C6.854 3.07089 7.08092 2.40433 7.4672 1.85791C7.56071 1.72569 7.57349 1.55265 7.50051 1.40811C7.42748 1.26358 7.28065 1.17118 7.11872 1.16794C7.07917 1.16714 7.03956 1.16675 6.99984 1.16675Z"
                                    fill="currentColor"
                                 />
                              </svg>
                              Темна
                           </>
                        )}
                     </Button>
                  </div>
                  {exportEmails.includes(auth.user.email) ? (
                     <div className="grid grid-cols-[100px_1fr] py-4">
                        <p>Дані</p>
                        <div>
                           <div className="flex flex-wrap gap-2">
                              <ExportOrdersButton
                                 workspaceId={auth.workspace.id}
                              />
                              <ImportOrdersButton
                                 workspaceId={auth.workspace.id}
                              />
                           </div>
                           <p className="mt-7 text-muted text-xs">
                              <Icons.info className="mr-1 mb-1 inline-block size-4" />
                              Коли імпортуєте, колонки Номер, Товари та Створене
                              будуть ігноровані.
                           </p>
                        </div>
                     </div>
                  ) : null}{" "}
               </TabsPanel>
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
                  <div className="divide-y divide-neutral">
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
                                 name: auth.user.name,
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
                     <form
                        onSubmit={(e) => {
                           e.preventDefault()
                           if (auth.user.name === name) return
                           updateUser.mutate({
                              name,
                              image: auth.user.image ?? "",
                           })
                           setNameFocused(false)
                        }}
                     >
                        <Field className="grid grid-cols-[100px_1fr] items-center py-4">
                           <FieldLabel className="mt-2 md:mt-1">
                              Ім'я
                           </FieldLabel>
                           <div className={"relative max-w-[300px]"}>
                              <FieldControl
                                 value={name}
                                 onValueChange={(v) => setName(v as string)}
                                 placeholder="Уведіть ваше ім'я"
                                 name="name"
                                 onFocus={() => setNameFocused(true)}
                              />
                              {nameFocused && (
                                 <div className="absolute top-2 right-0 flex items-center gap-0.5">
                                    <Button
                                       size={"sm"}
                                       kind={"icon"}
                                    >
                                       <Icons.check className="size-5" />
                                    </Button>
                                    <Button
                                       size={"sm"}
                                       kind={"icon"}
                                       variant={"secondary"}
                                       type="button"
                                       onClick={() => {
                                          setNameFocused(false)
                                          setName(auth.user.name)
                                       }}
                                    >
                                       <Icons.xMark className="size-5" />
                                    </Button>
                                 </div>
                              )}
                           </div>
                        </Field>
                     </form>
                     <form
                        onSubmit={(e) => {
                           e.preventDefault()
                           if (auth.user.email === email) return
                           changeEmail.mutate({
                              newEmail: email,
                           })
                           setEmailFocused(false)
                        }}
                     >
                        <Field className="grid grid-cols-[100px_1fr] items-center py-4">
                           <FieldLabel className="mt-2 md:mt-1">
                              Email
                           </FieldLabel>
                           <div className={"relative max-w-[300px]"}>
                              <FieldControl
                                 className={"max-w-[300px]"}
                                 value={email}
                                 onValueChange={(v) => setEmail(v as string)}
                                 placeholder="Уведіть ваш email"
                                 name="email"
                                 onFocus={() => setEmailFocused(true)}
                              />{" "}
                              {emailFocused && (
                                 <div className="absolute top-2 right-0 flex items-center gap-0.5">
                                    <Button
                                       size={"sm"}
                                       kind={"icon"}
                                    >
                                       <Icons.check className="size-5" />
                                    </Button>
                                    <Button
                                       size={"sm"}
                                       kind={"icon"}
                                       variant={"secondary"}
                                       type="button"
                                       onClick={() => {
                                          setEmailFocused(false)
                                          setEmail(auth.user.email)
                                       }}
                                    >
                                       <Icons.xMark className="size-5" />
                                    </Button>
                                 </div>
                              )}
                           </div>
                        </Field>
                     </form>
                  </div>
               </TabsPanel>
            </Tabs>
         </MainScrollArea>
      </>
   )
}

function ExportOrdersButton({ workspaceId }: { workspaceId: string }) {
   const exportOrders = useMutation(
      trpc.order.export.mutationOptions({
         onSuccess: (result) => {
            // @ts-expect-error ...
            const blob = new Blob([new Uint8Array(result.data)], {
               type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })

            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = result.filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Експорт завершено")
         },
         onError: () => {
            toast.error("Помилка експорту")
         },
      }),
   )

   return (
      <Button
         className="w-fit"
         disabled={exportOrders.isPending}
         onClick={() => exportOrders.mutate({ workspaceId })}
      >
         {exportOrders.isPending ? "Зачекайте..." : "Експортувати замовлення"}
      </Button>
   )
}

function ImportOrdersButton({ workspaceId }: { workspaceId: string }) {
   const queryClient = useQueryClient()
   const orderQueryOptions = useOrderQueryOptions()

   const importOrders = useMutation(
      trpc.order.import.mutationOptions({
         onSuccess: (result) => {
            toast.success(result.message)
            queryClient.invalidateQueries(orderQueryOptions.list)
         },
         onError: (error) => {
            toast.error(error.message)
         },
      }),
   )

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls"))
         return toast.error("Будь ласка, оберіть Excel файл (.xlsx або .xls)")

      try {
         const arrayBuffer = await file.arrayBuffer()
         const data = Array.from(new Uint8Array(arrayBuffer))

         importOrders.mutate({ workspaceId, data })
      } catch (_error) {
         toast.error("Помилка читання файлу")
      }

      e.target.value = ""
   }

   return (
      <div className="flex items-center gap-2">
         <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={importOrders.isPending}
            className="hidden"
            id={`import-orders-${workspaceId}`}
         />
         <Button
            variant="secondary"
            className="w-fit"
            disabled={importOrders.isPending}
            onClick={() =>
               document.getElementById(`import-orders-${workspaceId}`)?.click()
            }
         >
            {importOrders.isPending ? "Зачекайте..." : "Імпортувати замовлення"}
         </Button>
      </div>
   )
}
