import { order } from "@ledgerblocks/core/order/schema"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { desc, eq } from "drizzle-orm"
import { createInsertSchema, createUpdateSchema } from "drizzle-zod"
import { z } from "zod"

export const orderRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ workspaceId: z.string() }))
      .query(async ({ ctx, input }) => {
         return await ctx.db.query.order.findMany({
            where: eq(order.workspaceId, input.workspaceId),
            with: {
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               procurements: {
                  columns: {
                     id: true,
                     quantity: true,
                     purchasePrice: true,
                     status: true,
                     note: true,
                  },
                  with: {
                     buyer: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
                  orderBy: [desc(procurement.createdAt)],
               },
            },
            orderBy: [desc(order.createdAt)],
         })
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(createInsertSchema(order).omit({ creatorId: true }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.insert(order).values({
            creatorId: ctx.user.id,
            workspaceId: input.workspaceId,
            name: input.name,
            quantity: input.quantity,
            sellingPrice: input.sellingPrice,
            note: input.note,
         })
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createUpdateSchema(order)
            .pick({
               id: true,
               workspaceId: true,
               name: true,
               note: true,
               quantity: true,
               sellingPrice: true,
               status: true,
            })
            .required({ id: true, workspaceId: true }),
      )
      .mutation(async ({ ctx, input }) => {
         await ctx.db
            .update(order)
            .set({
               name: input.name,
               quantity: input.quantity,
               sellingPrice: input.sellingPrice,
               note: input.note,
               status: input.status,
            })
            .where(eq(order.id, input.id))
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await ctx.db.delete(order).where(eq(order.id, input.id))
      }),
})
