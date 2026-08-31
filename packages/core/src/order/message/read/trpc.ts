import { orderMessageRead } from "@unfiddle/core/order/message/read/schema"
import { orderMessage } from "@unfiddle/core/order/message/schema"
import { order } from "@unfiddle/core/order/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, count, eq, gt, isNull, ne, sql } from "drizzle-orm"
import { z } from "zod"

export const orderMessageReadRouter = t.router({
   markAsRead: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .insert(orderMessageRead)
            .values({
               userId: ctx.user.id,
               orderId: input.orderId,
               workspaceId: input.workspaceId,
               lastReadAt: new Date(),
            })
            .onConflictDoUpdate({
               target: [orderMessageRead.userId, orderMessageRead.orderId],
               set: {
                  lastReadAt: new Date(),
                  updatedAt: new Date(),
               },
            })
      }),
   orderUnreadCount: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const readRecord = await ctx.db.query.orderMessageRead.findFirst({
            where: and(
               eq(orderMessageRead.userId, ctx.user.id),
               eq(orderMessageRead.orderId, input.orderId),
               eq(orderMessageRead.workspaceId, input.workspaceId),
            ),
         })

         const unreadCount = await ctx.db
            .select({ count: count() })
            .from(orderMessage)
            .where(
               and(
                  eq(orderMessage.orderId, input.orderId),
                  eq(orderMessage.workspaceId, input.workspaceId),
                  ne(orderMessage.creatorId, ctx.user.id),
                  readRecord
                     ? gt(orderMessage.createdAt, readRecord.lastReadAt)
                     : sql`1=1`,
               ),
            )
            .get()

         return { count: unreadCount?.count ?? 0 }
      }),
   unreadCount: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const result = await ctx.db
            .select({ count: count() })
            .from(order)
            .innerJoin(orderMessage, eq(orderMessage.orderId, order.id))
            .leftJoin(
               orderMessageRead,
               and(
                  eq(orderMessageRead.orderId, order.id),
                  eq(orderMessageRead.userId, ctx.user.id),
               ),
            )
            .where(
               and(
                  eq(order.workspaceId, input.workspaceId),
                  isNull(order.deletedAt),
                  ne(orderMessage.creatorId, ctx.user.id),
                  sql`(${orderMessageRead.lastReadAt} IS NULL OR ${orderMessage.createdAt} > ${orderMessageRead.lastReadAt})`,
               ),
            )
            .get()

         return { count: result?.count ?? 0 }
      }),
   listUnreadOrders: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const results = await ctx.db
            .selectDistinct({ orderId: orderMessage.orderId })
            .from(order)
            .innerJoin(orderMessage, eq(orderMessage.orderId, order.id))
            .leftJoin(
               orderMessageRead,
               and(
                  eq(orderMessageRead.orderId, order.id),
                  eq(orderMessageRead.userId, ctx.user.id),
               ),
            )
            .where(
               and(
                  eq(order.workspaceId, input.workspaceId),
                  isNull(order.deletedAt),
                  ne(orderMessage.creatorId, ctx.user.id),
                  sql`(${orderMessageRead.lastReadAt} IS NULL OR ${orderMessage.createdAt} > ${orderMessageRead.lastReadAt})`,
               ),
            )

         return { orderIds: results.map((r) => r.orderId) }
      }),
})
