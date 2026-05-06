import { queryClient, trpc, trpcClient } from "@/trpc"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"
import { estimateMessageSchema } from "@unfiddle/core/estimate/message/schema"

const createCollectionInstance = (estimateId: string, workspaceId: string) =>
   createCollection(
      queryCollectionOptions({
         queryClient,
         queryKey: trpc.estimate.message.list.queryKey({
            estimateId,
            workspaceId,
         }),
         queryFn: async () => {
            return trpcClient.estimate.message.list.query({
               estimateId,
               workspaceId,
            })
         },
         getKey: (message) => message.id,
         schema: estimateMessageSchema,
         onInsert: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]
            await trpcClient.estimate.message.create.mutate({
               id: modified.id,
               estimateId: modified.estimateId,
               workspaceId: modified.workspaceId,
               content: modified.content,
               replyToId: modified.replyToId,
               attachments: modified.attachments?.map((a) => ({
                  id: a.id,
                  url: a.url,
                  type: a.type,
                  size: a.size,
                  name: a.name,
                  width: a.width,
                  height: a.height,
               })),
            })
         },
         onUpdate: async ({ transaction }) => {
            const { original, changes } = transaction.mutations[0]
            const content = changes.content
            if (!content) return

            await trpcClient.estimate.message.update.mutate({
               estimateMessageId: original.id,
               estimateId: original.estimateId,
               workspaceId: original.workspaceId,
               content,
            })
         },
         onDelete: async ({ transaction }) => {
            const { original } = transaction.mutations[0]
            await trpcClient.estimate.message.delete.mutate({
               estimateMessageId: original.id,
               estimateId: original.estimateId,
               workspaceId: original.workspaceId,
            })
         },
      }),
   )

const collectionMap = new Map<
   string,
   ReturnType<typeof createCollectionInstance>
>()

export const estimateMessageCollection = (
   estimateId: string,
   workspaceId: string,
) => {
   const key = `${estimateId}:${workspaceId}`

   if (!collectionMap.has(key)) {
      collectionMap.set(key, createCollectionInstance(estimateId, workspaceId))
   }

   const collection = collectionMap.get(key)
   if (!collection) throw new Error("Failed to get collection")

   return collection
}
