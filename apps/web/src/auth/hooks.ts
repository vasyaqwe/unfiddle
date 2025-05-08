import { CACHE_FOREVER } from "@/api"
import { authClient } from "@/auth"
import { trpc } from "@/trpc"
import invariant from "@ledgerblocks/core/invariant"
import {
   useMutation,
   useQueryClient,
   useSuspenseQuery,
} from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"

const Layout = getRouteApi("/_authed/$workspaceId/_layout")

export function useAuth() {
   const params = Layout.useParams()
   const queryClient = useQueryClient()
   const navigate = useNavigate()

   const userQueryOptions = trpc.user.me.queryOptions(undefined, {
      staleTime: CACHE_FOREVER,
      retry: false,
   })

   const workspaceQueryOptions = trpc.workspace.one.queryOptions(
      { id: params.workspaceId },
      { staleTime: CACHE_FOREVER },
   )

   const user = useSuspenseQuery(userQueryOptions)
   const workspace = useSuspenseQuery(workspaceQueryOptions)

   invariant(workspace.data?.id, "workspace not found")

   const signout = useMutation({
      mutationFn: async () => {
         const res = await authClient.signOut()
         if (res.error) throw res.error
      },
      onError: () => {
         queryClient.clear()
         navigate({ to: "/login" })
      },
      onSuccess: () => {
         queryClient.clear()
         navigate({ to: "/login" })
      },
   })

   return {
      user: { ...user.data, image: user.data.image ?? null },
      queryOptions: {
         user: userQueryOptions,
         workspace: workspaceQueryOptions,
      },
      workspace: workspace.data,
      signout,
   }
}
