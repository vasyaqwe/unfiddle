import {} from "@ledgerblocks/core/order/constants"
import { orderFilterSchema } from "@ledgerblocks/core/order/filter"
import {
   order,
   orderCounter,
   updateOrderSchema,
} from "@ledgerblocks/core/order/schema"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { tryCatch } from "@ledgerblocks/core/try-catch"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const orderRouter = t.router({
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
            filter: orderFilterSchema,
         }),
      )
      .query(async ({ ctx, input }) => {
         const filter = input.filter

         const whereConditions = [eq(order.workspaceId, input.workspaceId)]

         if (filter.status?.length)
            whereConditions.push(inArray(order.status, filter.status))

         if (filter.severity?.length)
            whereConditions.push(inArray(order.severity, filter.severity))

         if (filter.archived) {
            whereConditions.push(isNotNull(order.deletedAt))
         } else {
            whereConditions.push(isNull(order.deletedAt))
         }

         if (filter.q?.length) {
            const searchTerm = `%${filter.q.trim().toLowerCase().normalize("NFC")}%`

            whereConditions.push(
               sql`(
                ${order.nameLower} LIKE ${searchTerm}
                OR
                ${order.shortId} LIKE ${searchTerm}
                OR
                ${order.quantity} LIKE ${searchTerm}
                OR
                ${order.sellingPrice} LIKE ${searchTerm}
              )`,
            )
         }

         return await ctx.db.query.order.findMany({
            where: and(...whereConditions),
            columns: {
               id: true,
               shortId: true,
               name: true,
               severity: true,
               quantity: true,
               sellingPrice: true,
               status: true,
               note: true,
               creatorId: true,
               deletedAt: true,
            },
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
      .input(createInsertSchema(order).omit({ creatorId: true, shortId: true }))
      .mutation(async ({ ctx, input }) => {
         const existingCounter = await ctx.db.query.orderCounter.findFirst({
            where: eq(orderCounter.workspaceId, input.workspaceId),
         })
         const lastId = existingCounter?.lastId ?? 0
         const nextId = lastId + 1

         const nameLower = input.name.normalize("NFC").toLocaleLowerCase("uk")

         const createdOrder = await ctx.db
            .insert(order)
            .values({
               shortId: nextId,
               creatorId: ctx.user.id,
               workspaceId: input.workspaceId,
               severity: input.severity,
               name: input.name,
               nameLower,
               quantity: input.quantity,
               sellingPrice: input.sellingPrice,
               note: input.note,
            })
            .returning()
            .get()

         const batchQueries: BatchItem[] = []

         if (!existingCounter) {
            batchQueries.push(
               ctx.db
                  .insert(orderCounter)
                  .values({ workspaceId: input.workspaceId })
                  .onConflictDoNothing(),
            )
         }

         batchQueries.push(
            ctx.db
               .update(orderCounter)
               .set({ lastId: nextId })
               .where(eq(orderCounter.workspaceId, input.workspaceId)),
         )

         const batch = await tryCatch(
            ctx.db.batch(
               batchQueries as unknown as readonly [
                  BatchItem<"sqlite">,
                  ...BatchItem<"sqlite">[],
               ],
            ),
         )

         if (batch.error || batch.data.some((r) => r.error)) {
            await ctx.db.delete(order).where(eq(order.id, createdOrder.id))
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
         }

         return createdOrder
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateOrderSchema)
      .mutation(async ({ ctx, input }) => {
         const nameLower = input.name?.normalize("NFC").toLocaleLowerCase("uk")

         await ctx.db
            .update(order)
            .set({
               name: input.name,
               nameLower,
               quantity: input.quantity,
               sellingPrice: input.sellingPrice,
               note: input.note,
               status: input.status,
               severity: input.severity,
               deletedAt:
                  input.deletedAt === undefined
                     ? undefined
                     : input.deletedAt === null
                       ? null
                       : new Date(input.deletedAt),
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
