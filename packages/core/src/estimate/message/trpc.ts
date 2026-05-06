import { TRPCError } from "@trpc/server"
import { attachment } from "@unfiddle/core/attachment/schema"
import { estimateMessageReadRouter } from "@unfiddle/core/estimate/message/read/trpc"
import { estimateMessage } from "@unfiddle/core/estimate/message/schema"
import {
   createEstimateMessageSchema,
   updateEstimateMessageSchema,
} from "@unfiddle/core/estimate/message/zod"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const estimateMessageRouter = t.router({
   read: estimateMessageReadRouter,
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const messages = await ctx.db.query.estimateMessage.findMany({
            where: and(
               eq(estimateMessage.estimateId, input.estimateId),
               eq(estimateMessage.workspaceId, input.workspaceId),
            ),
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               reply: {
                  columns: {
                     id: true,
                     content: true,
                     creatorId: true,
                  },
                  with: {
                     creator: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
               },
               attachments: {
                  columns: {
                     id: true,
                     url: true,
                     type: true,
                     size: true,
                     name: true,
                     width: true,
                     height: true,
                  },
                  orderBy: [desc(attachment.createdAt)],
               },
            },
            orderBy: [desc(estimateMessage.createdAt)],
         })

         return messages
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createEstimateMessageSchema)
      .mutation(async ({ ctx, input }) => {
         const { attachments, ...messageData } = input

         const message = await ctx.db
            .insert(estimateMessage)
            .values({
               ...messageData,
               creatorId: ctx.user.id,
            })
            .returning()
            .get()

         if (attachments && attachments.length > 0) {
            await ctx.db.insert(attachment).values(
               attachments.map((a) => ({
                  ...a,
                  subjectId: message.id,
                  subjectType: "estimate_message" as const,
                  workspaceId: input.workspaceId,
                  creatorId: ctx.user.id,
               })),
            )
         }

         const enrichedMessage = await ctx.db.query.estimateMessage.findFirst({
            where: eq(estimateMessage.id, message.id),
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               reply: {
                  columns: {
                     id: true,
                     content: true,
                     creatorId: true,
                  },
                  with: {
                     creator: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
               },
               attachments: {
                  columns: {
                     id: true,
                     url: true,
                     type: true,
                     size: true,
                     name: true,
                     width: true,
                     height: true,
                  },
               },
            },
         })

         if (!enrichedMessage) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Failed to fetch created message",
            })
         }

         return enrichedMessage
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateEstimateMessageSchema)
      .mutation(async ({ ctx, input }) => {
         const existing = await ctx.db.query.estimateMessage.findFirst({
            where: and(
               eq(estimateMessage.id, input.estimateMessageId),
               eq(estimateMessage.workspaceId, input.workspaceId),
            ),
         })

         if (!existing) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Повідомлення не знайдено",
            })
         }

         if (existing.creatorId !== ctx.user.id) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Ви можете редагувати тільки свої повідомлення",
            })
         }

         await ctx.db
            .update(estimateMessage)
            .set({
               content: input.content,
               updatedAt: new Date(),
            })
            .where(
               and(
                  eq(estimateMessage.id, input.estimateMessageId),
                  eq(estimateMessage.workspaceId, input.workspaceId),
               ),
            )

         return input
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateMessageId: z.string(),
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const existing = await ctx.db.query.estimateMessage.findFirst({
            where: and(
               eq(estimateMessage.id, input.estimateMessageId),
               eq(estimateMessage.workspaceId, input.workspaceId),
            ),
         })

         if (!existing) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Повідомлення не знайдено",
            })
         }

         if (existing.creatorId !== ctx.user.id) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Ви можете видалити тільки свої повідомлення",
            })
         }

         // Clear replyToId references (migration missing ON DELETE CASCADE)
         await ctx.db
            .update(estimateMessage)
            .set({ replyToId: null })
            .where(eq(estimateMessage.replyToId, input.estimateMessageId))

         await ctx.db
            .delete(estimateMessage)
            .where(
               and(
                  eq(estimateMessage.id, input.estimateMessageId),
                  eq(estimateMessage.workspaceId, input.workspaceId),
               ),
            )
      }),
})
