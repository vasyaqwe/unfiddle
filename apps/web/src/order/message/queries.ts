import { useLiveQuery } from "@tanstack/react-db"
import { useAuth } from "@/auth/hooks"
import { orderMessageCollection } from "./collection"

export function useOrderMessagesQuery(orderId: string) {
   const auth = useAuth()
   const workspaceId = auth.workspace.id

   const collection = orderMessageCollection(orderId, workspaceId)

   return useLiveQuery((q) =>
      q.from({ msg: collection }).orderBy(({ msg }) => msg.createdAt, "asc"),
   )
}
