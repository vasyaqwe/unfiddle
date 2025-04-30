import { order } from "@ledgerblocks/core/database/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { workspace } from "@ledgerblocks/core/workspace/schema"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const orderRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.order.findMany({
            where: eq(order.workspaceId, input.workspaceId),
            with: {
               creator: true,
            },
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createInsertSchema(order).omit({ creatorId: true }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .insert(order)
            .values({
               creatorId: ctx.user.id,
               workspaceId: input.workspaceId,
               name: input.name,
               quantity: input.quantity,
               sellingPrice: input.sellingPrice,
               note: input.note,
            })
            .returning({
               id: workspace.id,
            })
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(order).where(eq(order.id, input.id))
      }),
})
