import { orderMessageRead } from "@unfiddle/core/order/message/read/schema"
import { orderMessage } from "@unfiddle/core/order/message/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, count, eq, gt, sql } from "drizzle-orm"
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
         // Get all orders in workspace
         const orders = await ctx.db.query.order.findMany({
            where: eq(orderMessage.workspaceId, input.workspaceId),
            columns: { id: true },
         })

         // Get user's read records for this workspace
         const readRecords = await ctx.db.query.orderMessageRead.findMany({
            where: and(
               eq(orderMessageRead.userId, ctx.user.id),
               eq(orderMessageRead.workspaceId, input.workspaceId),
            ),
         })

         const readRecordMap = new Map(
            readRecords.map((r) => [r.orderId, r.lastReadAt]),
         )

         // Count unread messages for each order
         let totalUnread = 0
         for (const order of orders) {
            const lastReadAt = readRecordMap.get(order.id)

            const unreadCount = await ctx.db
               .select({ count: count() })
               .from(orderMessage)
               .where(
                  and(
                     eq(orderMessage.orderId, order.id),
                     eq(orderMessage.workspaceId, input.workspaceId),
                     lastReadAt
                        ? gt(orderMessage.createdAt, lastReadAt)
                        : sql`1=1`,
                  ),
               )
               .get()

            totalUnread += unreadCount?.count ?? 0
         }

         return { count: totalUnread }
      }),
   listUnreadOrders: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         // Get all orders in workspace
         const orders = await ctx.db.query.order.findMany({
            where: eq(orderMessage.workspaceId, input.workspaceId),
            columns: { id: true },
         })

         // Get user's read records for this workspace
         const readRecords = await ctx.db.query.orderMessageRead.findMany({
            where: and(
               eq(orderMessageRead.userId, ctx.user.id),
               eq(orderMessageRead.workspaceId, input.workspaceId),
            ),
         })

         const readRecordMap = new Map(
            readRecords.map((r) => [r.orderId, r.lastReadAt]),
         )

         // Find orders with unread messages
         const unreadOrderIds: string[] = []
         for (const order of orders) {
            const lastReadAt = readRecordMap.get(order.id)

            const unreadCount = await ctx.db
               .select({ count: count() })
               .from(orderMessage)
               .where(
                  and(
                     eq(orderMessage.orderId, order.id),
                     eq(orderMessage.workspaceId, input.workspaceId),
                     lastReadAt
                        ? gt(orderMessage.createdAt, lastReadAt)
                        : sql`1=1`,
                  ),
               )
               .get()

            if ((unreadCount?.count ?? 0) > 0) {
               unreadOrderIds.push(order.id)
            }
         }

         return { orderIds: unreadOrderIds }
      }),
})
