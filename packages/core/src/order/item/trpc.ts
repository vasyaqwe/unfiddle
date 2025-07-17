import { TRPCError } from "@trpc/server"
import { orderItem, updateOrderItemSchema } from "@unfiddle/core/order/schema"
import { t } from "@unfiddle/core/trpc/context"
import { tryCatch } from "@unfiddle/core/try-catch"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const orderItemRouter = t.router({
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createInsertSchema(orderItem).extend({ workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         return await ctx.db.insert(orderItem).values(input).returning().get()
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateOrderItemSchema)
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(orderItem)
            .set(input)
            .where(
               and(
                  eq(orderItem.id, input.id),
                  eq(orderItem.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderItemId: z.string(),
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         const res = await tryCatch(
            ctx.db
               .delete(orderItem)
               .where(
                  and(
                     eq(orderItem.id, input.orderItemId),
                     eq(orderItem.workspaceId, input.workspaceId),
                  ),
               ),
         )
         if (res.error?.message.includes("SQLITE_CONSTRAINT"))
            throw new TRPCError({
               code: "CONFLICT",
               message: "Спершу видаліть закупівлі з цим товаром",
            })
      }),
})
