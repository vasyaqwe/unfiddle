import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { keepPreviousData } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"

export function useOrderQueryOptions() {
   const auth = useAuth()
   const search = useSearch({ strict: false })

   const list = trpc.order.list.queryOptions(
      {
         workspaceId: auth.workspace.id,
         filter: search,
      },
      {
         placeholderData: keepPreviousData,
      },
   )

   const listArchived = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: { ...search, archived: true },
   })

   const listNotArchived = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: { ...search, archived: false },
   })

   return { list, listArchived, listNotArchived }
}
