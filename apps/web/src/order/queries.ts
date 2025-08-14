import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { keepPreviousData } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { useDeferredValue } from "react"

export function useOrderQueryOptions() {
   const auth = useAuth()
   const search = useDeferredValue(useSearch({ strict: false }))

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

   return { list, listArchived }
}
