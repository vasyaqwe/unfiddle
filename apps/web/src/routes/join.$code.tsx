import { CACHE_FOREVER, api } from "@/api"
import { trpc } from "@/trpc"
import { WorkspaceLogo } from "@/workspace/components/workspace-logo"
import { useMutation } from "@tanstack/react-query"
import {
   Link,
   createFileRoute,
   notFound,
   redirect,
   useNavigate,
} from "@tanstack/react-router"
import { Button } from "@unfiddle/ui/components/button"
import { Loading } from "@unfiddle/ui/components/loading"
import { Logo } from "@unfiddle/ui/components/logo"

export const Route = createFileRoute("/join/$code")({
   component: RouteComponent,
   beforeLoad: async (opts) => {
      const user = await opts.context.queryClient
         .ensureQueryData(
            trpc.user.me.queryOptions(undefined, {
               staleTime: CACHE_FOREVER,
               retry: false,
            }),
         )
         .catch(() => {
            throw redirect({
               to: "/login",
               search: { invite_code: opts.params.code },
            })
         })

      if (!user)
         throw redirect({
            to: "/login",
            search: { invite_code: opts.params.code },
         })
   },
   loader: async (opts) => {
      const res = await api.workspace[":code"].$get({
         param: opts.params,
      })
      const found = await res.json()
      if (!found) throw notFound()

      return found
   },
   pendingComponent: () => {
      return (
         <main className="grid h-svh w-full place-items-center bg-background text-center">
            <Loading
               size={"xl"}
               className="-translate-y-8 inset-0 m-auto"
            />
         </main>
      )
   },
})

function RouteComponent() {
   const params = Route.useParams()
   const navigate = useNavigate()
   const workspace = Route.useLoaderData()
   const mutate = useMutation(
      trpc.workspace.join.mutationOptions({
         onSuccess: (params) =>
            navigate({
               to: "/$workspaceId",
               params: { workspaceId: params.id },
            }),
      }),
   )

   return (
      <main className="grid h-svh w-full place-items-center bg-background text-center">
         <Link
            to="/"
            className="absolute top-3 left-3 p-2"
         >
            <Logo />
         </Link>
         <div className="-mt-16 relative w-full max-w-lg">
            <WorkspaceLogo
               workspace={workspace}
               size={40}
               className="mx-auto"
            />
            <h1 className="mt-5 mb-3 text-2xl">
               Приєднайтеся до {workspace.name}
            </h1>
            <p className="mb-7 text-foreground/90 text-lg">
               Вас запросили приєднатися до проєкту <b>{workspace.name}</b>.
            </p>
            <Button
               size={"lg"}
               className="min-w-[150px]"
               onClick={() => mutate.mutate(params)}
               pending={mutate.isPending || mutate.isSuccess}
               disabled={mutate.isPending || mutate.isSuccess}
            >
               Приєднатися
            </Button>
         </div>
      </main>
   )
}
