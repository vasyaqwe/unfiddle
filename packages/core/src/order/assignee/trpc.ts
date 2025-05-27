import { orderAssignee } from "@unfiddle/core/order/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

export const orderAssigneeRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            userId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .insert(orderAssignee)
            .values({
               userId: input.userId,
               orderId: input.orderId,
            })
            .onConflictDoNothing()
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            userId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(orderAssignee)
            .where(
               and(
                  eq(orderAssignee.orderId, input.orderId),
                  eq(orderAssignee.userId, input.userId),
               ),
            )
      }),
})
