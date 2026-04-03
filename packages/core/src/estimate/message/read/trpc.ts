import { estimateMessageRead } from "@unfiddle/core/estimate/message/read/schema"
import { estimateMessage } from "@unfiddle/core/estimate/message/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, count, eq, gt, ne, sql } from "drizzle-orm"
import { z } from "zod"

export const estimateMessageReadRouter = t.router({
   markAsRead: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .insert(estimateMessageRead)
            .values({
               userId: ctx.user.id,
               estimateId: input.estimateId,
               workspaceId: input.workspaceId,
               lastReadAt: new Date(),
            })
            .onConflictDoUpdate({
               target: [
                  estimateMessageRead.userId,
                  estimateMessageRead.estimateId,
               ],
               set: {
                  lastReadAt: new Date(),
                  updatedAt: new Date(),
               },
            })
      }),
   estimateUnreadCount: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const readRecord = await ctx.db.query.estimateMessageRead.findFirst({
            where: and(
               eq(estimateMessageRead.userId, ctx.user.id),
               eq(estimateMessageRead.estimateId, input.estimateId),
               eq(estimateMessageRead.workspaceId, input.workspaceId),
            ),
         })

         const unreadCount = await ctx.db
            .select({ count: count() })
            .from(estimateMessage)
            .where(
               and(
                  eq(estimateMessage.estimateId, input.estimateId),
                  eq(estimateMessage.workspaceId, input.workspaceId),
                  ne(estimateMessage.creatorId, ctx.user.id),
                  readRecord
                     ? gt(estimateMessage.createdAt, readRecord.lastReadAt)
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
            .from(estimateMessage)
            .leftJoin(
               estimateMessageRead,
               and(
                  eq(
                     estimateMessageRead.estimateId,
                     estimateMessage.estimateId,
                  ),
                  eq(estimateMessageRead.userId, ctx.user.id),
               ),
            )
            .where(
               and(
                  eq(estimateMessage.workspaceId, input.workspaceId),
                  ne(estimateMessage.creatorId, ctx.user.id),
                  sql`(${estimateMessageRead.lastReadAt} IS NULL OR ${estimateMessage.createdAt} > ${estimateMessageRead.lastReadAt})`,
               ),
            )
            .get()

         return { count: result?.count ?? 0 }
      }),
   listUnreadEstimates: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const results = await ctx.db
            .selectDistinct({ estimateId: estimateMessage.estimateId })
            .from(estimateMessage)
            .leftJoin(
               estimateMessageRead,
               and(
                  eq(
                     estimateMessageRead.estimateId,
                     estimateMessage.estimateId,
                  ),
                  eq(estimateMessageRead.userId, ctx.user.id),
               ),
            )
            .where(
               and(
                  eq(estimateMessage.workspaceId, input.workspaceId),
                  ne(estimateMessage.creatorId, ctx.user.id),
                  sql`(${estimateMessageRead.lastReadAt} IS NULL OR ${estimateMessage.createdAt} > ${estimateMessageRead.lastReadAt})`,
               ),
            )

         return { estimateIds: results.map((r) => r.estimateId) }
      }),
})
