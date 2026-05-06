import { orderItemAssignee } from "@unfiddle/core/database/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

export const orderItemAssigneeRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            userId: z.string(),
            orderItemId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .insert(orderItemAssignee)
            .values({
               userId: input.userId,
               orderItemId: input.orderItemId,
               workspaceId: input.workspaceId,
            })
            .onConflictDoNothing()
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            userId: z.string(),
            orderItemId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(orderItemAssignee)
            .where(
               and(
                  eq(orderItemAssignee.orderItemId, input.orderItemId),
                  eq(orderItemAssignee.userId, input.userId),
               ),
            )
      }),
})
