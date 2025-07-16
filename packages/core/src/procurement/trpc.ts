import { TRPCError } from "@trpc/server"
import { orderItem } from "@unfiddle/core/order/schema"
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
         const createdProcurement = await ctx.db
            .insert(procurement)
            .values({
               ...input,
               creatorId: ctx.user.id,
            })
            .returning()
            .get()
         const orderItemId = createdProcurement.orderItemId
         if (!orderItemId)
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })

         const foundItem = await ctx.db.query.orderItem.findFirst({
            where: eq(orderItem.id, orderItemId),
            columns: {
               name: true,
            },
         })

         return {
            ...createdProcurement,
            orderItem: { name: foundItem?.name ?? "" },
         }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateProcurementSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(procurement)
            .set(input)
            .where(eq(procurement.id, input.id))
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(procurement).where(eq(procurement.id, input.id))
      }),
})
