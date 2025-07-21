import { useAuth } from "@/auth/hooks"
import { trpc } from "@/trpc"
import { keepPreviousData } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"
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

   const listNotArchived = trpc.order.list.queryOptions({
      workspaceId: auth.workspace.id,
      filter: { ...search, archived: false },
   })

   return { list, listArchived, listNotArchived }
}

export function useOrderOneQueryOptions() {
   const params = useParams({
      from: "/_authed/$workspaceId/_layout/(order)/order/$orderId",
   })
   const auth = useAuth()
   return trpc.order.one.queryOptions({
      orderId: params.orderId,
      workspaceId: auth.workspace.id,
   })
}
