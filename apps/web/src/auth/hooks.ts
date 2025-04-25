import { CACHE_FOREVER } from "@/api"
import { authClient } from "@/auth"
import { trpc } from "@/trpc"
import {
   useMutation,
   useQueryClient,
   useSuspenseQuery,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

export function useAuth() {
   const queryClient = useQueryClient()
   const navigate = useNavigate()

   const user = useSuspenseQuery(
      trpc.user.me.queryOptions(undefined, {
         staleTime: CACHE_FOREVER,
         retry: false,
      }),
   )

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
      user: user.data,
      signout,
   }
}
