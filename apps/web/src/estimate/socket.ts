import { useAuth } from "@/auth/hooks"
import { env } from "@/env"
import { useOptimisticCreateEstimateItem } from "@/estimate/item/mutations/use-create-estimate-item"
import { useOptimisticDeleteEstimateItem } from "@/estimate/item/mutations/use-delete-estimate-item"
import { useOptimisticUpdateEstimateItem } from "@/estimate/item/mutations/use-update-estimate-item"
import { estimateMessageCollection } from "@/estimate/message/collection"
import { useOptimisticCreateEstimate } from "@/estimate/mutations/use-create-estimate"
import { useOptimisticDeleteEstimate } from "@/estimate/mutations/use-delete-estimate"
import { useOptimisticUpdateEstimate } from "@/estimate/mutations/use-update-estimate"
import { sendNotification } from "@/notification/utils"
import { trpc } from "@/trpc"
import { useQueryClient } from "@tanstack/react-query"
import { useMatches, useNavigate, useParams } from "@tanstack/react-router"
import type { EstimateEvent } from "@unfiddle/core/estimate/types"
import { useTabFocused } from "@unfiddle/ui/hooks/use-tab-focused"
import usePartySocket from "partysocket/react"

export function useEstimateSocket() {
   const maybeParams = useParams({ strict: false })
   const matches = useMatches()
   const navigate = useNavigate()
   const auth = useAuth()
   const queryClient = useQueryClient()
   const create = useOptimisticCreateEstimate()
   const update = useOptimisticUpdateEstimate()
   const deleteEstimate = useOptimisticDeleteEstimate()
   const createItem = useOptimisticCreateEstimateItem()
   const updateItem = useOptimisticUpdateEstimateItem()
   const deleteItem = useOptimisticDeleteEstimateItem()
   const tabFocused = useTabFocused()

   return usePartySocket({
      host: env.COLLABORATION_URL,
      party: "estimate",
      room: auth.workspace.id,
      async onMessage(event) {
         const data = JSON.parse(event.data) as EstimateEvent

         if (data.senderId === auth.user.id) return

         if (data.action === "create_item") return createItem(data)
         if (data.action === "update_item") return updateItem(data.item)
         if (data.action === "delete_item") return deleteItem(data)

         if (data.action === "create_message") {
            const collection = estimateMessageCollection(
               data.estimateId,
               data.workspaceId,
            )

            queryClient.setQueryData(
               trpc.estimate.message.read.estimateUnreadCount.queryKey({
                  estimateId: data.estimateId,
                  workspaceId: data.workspaceId,
               }),
               (old: { count: number } | undefined) => ({
                  count: (old?.count ?? 0) + 1,
               }),
            )
            queryClient.setQueryData(
               trpc.estimate.message.read.unreadCount.queryKey({
                  workspaceId: data.workspaceId,
               }),
               (old: { count: number } | undefined) => ({
                  count: (old?.count ?? 0) + 1,
               }),
            )
            queryClient.setQueryData(
               trpc.estimate.message.read.listUnreadEstimates.queryKey({
                  workspaceId: data.workspaceId,
               }),
               (old: { estimateIds: string[] } | undefined) => {
                  const currentEstimateIds = old?.estimateIds ?? []
                  if (currentEstimateIds.includes(data.estimateId)) {
                     return old
                  }
                  return {
                     estimateIds: [...currentEstimateIds, data.estimateId],
                  }
               },
            )

            if (collection.status === "ready") {
               collection.utils.writeInsert(data.message)
            }

            if (
               maybeParams.estimateId === data.estimateId &&
               matches.some(
                  (m) =>
                     m.routeId ===
                     "/_authed/$workspaceId/_layout/(estimate)/estimate/$estimateId/_layout/chat",
               ) &&
               tabFocused
            )
               return

            sendNotification({
               title: data.message.creator.name,
               body:
                  data.message.content.length === 0
                     ? "Надіслав(-ла) файли"
                     : data.message.content,
               icon: data.message.creator.image,
               onClick: () => {
                  navigate({
                     to: "/$workspaceId/estimate/$estimateId/chat",
                     params: {
                        estimateId: data.estimateId,
                        workspaceId: auth.workspace.id,
                     },
                  })
               },
            })
         }
         if (data.action === "update_message") {
            const collection = estimateMessageCollection(
               data.estimateId,
               auth.workspace.id,
            )

            if (collection.status === "ready") {
               collection.utils.writeUpdate(data.message)

               for (const [, msg] of collection.entries()) {
                  if (
                     msg.replyToId === data.message.estimateMessageId &&
                     msg.reply
                  ) {
                     collection.update(msg.id, (draft) => {
                        if (draft.reply) {
                           draft.reply.content = data.message.content
                        }
                     })
                  }
               }
            }
         }
         if (data.action === "delete_message") {
            const collection = estimateMessageCollection(
               data.estimateId,
               data.workspaceId,
            )

            if (collection.status === "ready") {
               collection.utils.writeDelete(data.estimateMessageId)
            }

            setTimeout(() => {
               queryClient.invalidateQueries({
                  queryKey:
                     trpc.estimate.message.read.estimateUnreadCount.queryKey({
                        estimateId: data.estimateId,
                        workspaceId: data.workspaceId,
                     }),
               })
               queryClient.invalidateQueries({
                  queryKey: trpc.estimate.message.read.unreadCount.queryKey({
                     workspaceId: data.workspaceId,
                  }),
               })
               queryClient.invalidateQueries({
                  queryKey:
                     trpc.estimate.message.read.listUnreadEstimates.queryKey({
                        workspaceId: data.workspaceId,
                     }),
               })
            }, 100)
         }

         if (data.action === "create") return create(data.estimate)
         if (data.action === "update") return update(data.estimate)
         if (data.action === "delete") return deleteEstimate(data)
      },
   })
}
