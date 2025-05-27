import {
   procurement,
   updateProcurementSchema,
} from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const procurementRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(procurement)
            .omit({ creatorId: true })
            .extend({ workspaceId: z.string() }),
      )
      .mutation(async ({ ctx, input }) => {
         return await ctx.db
            .insert(procurement)
            .values({
               creatorId: ctx.user.id,
               orderId: input.orderId,
               quantity: input.quantity,
               purchasePrice: input.purchasePrice,
               note: input.note,
            })
            .returning()
            .get()
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateProcurementSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(procurement)
            .set({
               quantity: input.quantity,
               purchasePrice: input.purchasePrice,
               note: input.note,
               status: input.status,
            })
            .where(eq(procurement.id, input.id))
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(procurement).where(eq(procurement.id, input.id))
      }),
})
