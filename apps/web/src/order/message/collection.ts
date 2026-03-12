import { queryClient, trpc, trpcClient } from "@/trpc"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"
import { orderMessageSchema } from "@unfiddle/core/order/message/schema"

export const orderMessageCollection = (orderId: string, workspaceId: string) =>
   createCollection(
      queryCollectionOptions({
         queryClient,
         queryKey: trpc.order.message.list.queryKey({
            orderId,
            workspaceId,
         }),
         queryFn: async () => {
            return trpcClient.order.message.list.query({
               orderId,
               workspaceId,
            })
         },
         getKey: (message) => message.id,
         schema: orderMessageSchema,
         onInsert: async ({ transaction }) => {
            const { modified } = transaction.mutations[0]
            await trpcClient.order.message.create.mutate({
               orderId: modified.orderId,
               workspaceId: modified.workspaceId,
               content: modified.content,
            })
         },
         onUpdate: async ({ transaction }) => {
            const { original, changes } = transaction.mutations[0]
            const content = changes.content
            if (!content) return

            await trpcClient.order.message.update.mutate({
               orderMessageId: original.id,
               orderId: original.orderId,
               workspaceId: original.workspaceId,
               content,
            })
         },
         onDelete: async ({ transaction }) => {
            const { original } = transaction.mutations[0]
            await trpcClient.order.message.delete.mutate({
               orderMessageId: original.id,
               orderId: original.orderId,
               workspaceId: original.workspaceId,
            })
         },
      }),
   )
