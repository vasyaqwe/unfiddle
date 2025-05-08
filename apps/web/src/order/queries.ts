import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { useSearch } from "@tanstack/react-router"

export function useOrderQueryOptions() {
   const auth = useAuth()
   const search = useSearch({ strict: false })

   const list = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: search,
   })

   return { list }
}
