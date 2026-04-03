import { useAuth } from "@/auth/hooks"
import { useLiveQuery } from "@tanstack/react-db"
import { estimateMessageCollection } from "./collection"

export function useEstimateMessagesQuery(estimateId: string) {
   const auth = useAuth()
   const workspaceId = auth.workspace.id

   const collection = estimateMessageCollection(estimateId, workspaceId)

   return useLiveQuery((q) =>
      q.from({ msg: collection }).orderBy(({ msg }) => msg.createdAt, "asc"),
   )
}
