import { TRPCError } from "@trpc/server"
import { attachment } from "@unfiddle/core/attachment/schema"
import { orderMessageReadRouter } from "@unfiddle/core/order/message/read/trpc"
import { orderMessage } from "@unfiddle/core/order/message/schema"
import {
   createOrderMessageSchema,
   updateOrderMessageSchema,
} from "@unfiddle/core/order/message/zod"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const orderMessageRouter = t.router({
   read: orderMessageReadRouter,
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const messages = await ctx.db.query.orderMessage.findMany({
            where: and(
               eq(orderMessage.orderId, input.orderId),
               eq(orderMessage.workspaceId, input.workspaceId),
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
            orderBy: [desc(orderMessage.createdAt)],
         })

         return messages
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createOrderMessageSchema)
      .mutation(async ({ ctx, input }) => {
         const { attachments, ...messageData } = input

         const message = await ctx.db
            .insert(orderMessage)
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
                  subjectType: "order_message" as const,
                  workspaceId: input.workspaceId,
                  creatorId: ctx.user.id,
               })),
            )
         }

         const enrichedMessage = await ctx.db.query.orderMessage.findFirst({
            where: eq(orderMessage.id, message.id),
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
      .input(updateOrderMessageSchema)
      .mutation(async ({ ctx, input }) => {
         const existing = await ctx.db.query.orderMessage.findFirst({
            where: and(
               eq(orderMessage.id, input.orderMessageId),
               eq(orderMessage.workspaceId, input.workspaceId),
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
            .update(orderMessage)
            .set({
               content: input.content,
               updatedAt: new Date(),
            })
            .where(
               and(
                  eq(orderMessage.id, input.orderMessageId),
                  eq(orderMessage.workspaceId, input.workspaceId),
               ),
            )

         return input
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderMessageId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const existing = await ctx.db.query.orderMessage.findFirst({
            where: and(
               eq(orderMessage.id, input.orderMessageId),
               eq(orderMessage.workspaceId, input.workspaceId),
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
            .update(orderMessage)
            .set({ replyToId: null })
            .where(eq(orderMessage.replyToId, input.orderMessageId))

         await ctx.db
            .delete(orderMessage)
            .where(
               and(
                  eq(orderMessage.id, input.orderMessageId),
                  eq(orderMessage.workspaceId, input.workspaceId),
               ),
            )
      }),
})
