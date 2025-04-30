import { procurement } from "@ledgerblocks/core/procurement/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const procurementRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(procurement)
            .omit({ buyerId: true })
            .extend({ workspaceId: z.string() }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db.insert(procurement).values({
            buyerId: ctx.user.id,
            orderId: input.orderId,
            quantity: input.quantity,
            purchasePrice: input.purchasePrice,
            note: input.note,
         })
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(procurement).where(eq(procurement.id, input.id))
      }),
})
