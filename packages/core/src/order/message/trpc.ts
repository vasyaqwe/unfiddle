import { TRPCError } from "@trpc/server"
import { orderMessageReadRouter } from "@unfiddle/core/order/message/read/trpc"
import {
   createOrderMessageSchema,
   orderMessage,
   updateOrderMessageSchema,
} from "@unfiddle/core/order/message/schema"
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
            },
            orderBy: [desc(orderMessage.createdAt)],
         })

         return messages
      }),

   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createOrderMessageSchema)
      .mutation(async ({ ctx, input }) => {
         const message = await ctx.db
            .insert(orderMessage)
            .values({
               ...input,
               creatorId: ctx.user.id,
            })
            .returning()
            .get()

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
