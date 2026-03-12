import { useAuth } from "@/auth/hooks"
import { useLiveQuery } from "@tanstack/react-db"
import { orderMessageCollection } from "./collection"

export function useOrderMessages(orderId: string) {
   const auth = useAuth()
   const workspaceId = auth.workspace.id

   const collection = orderMessageCollection(orderId, workspaceId)

   const { data: messages } = useLiveQuery((q) =>
      q.from({ msg: collection }).orderBy(({ msg }) => msg.createdAt, "asc"),
   )

   return { messages }
}
