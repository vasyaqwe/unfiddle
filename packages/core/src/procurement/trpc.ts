import { TRPCError } from "@trpc/server"
import { orderItem } from "@unfiddle/core/order/item/schema"
import {
   procurement,
   updateProcurementSchema,
} from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const procurementRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            orderId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.procurement.findMany({
            where: and(
               eq(procurement.orderId, input.orderId),
               eq(procurement.workspaceId, input.workspaceId),
            ),
            columns: {
               id: true,
               quantity: true,
               purchasePrice: true,
               status: true,
               note: true,
               provider: true,
               orderItemId: true,
            },
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
            },
            orderBy: [desc(procurement.createdAt)],
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createInsertSchema(procurement).omit({ creatorId: true }))
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
            .where(
               and(
                  eq(procurement.id, input.id),
                  eq(procurement.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .delete(procurement)
            .where(
               and(
                  eq(procurement.id, input.id),
                  eq(procurement.workspaceId, input.workspaceId),
               ),
            )
      }),
})
