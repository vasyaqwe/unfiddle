import { TRPCError } from "@trpc/server"
import { orderAssigneeRouter } from "@unfiddle/core/order/assignee/trpc"
import { orderFilterSchema } from "@unfiddle/core/order/filter"
import { orderItemRouter } from "@unfiddle/core/order/item/trpc"
import {
   order,
   orderAssignee,
   orderCounter,
   orderItem,
   updateOrderSchema,
} from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import { tryCatch } from "@unfiddle/core/try-catch"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import {
   and,
   desc,
   eq,
   gte,
   inArray,
   isNotNull,
   isNull,
   lt,
   sql,
} from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const orderRouter = t.router({
   assignee: orderAssigneeRouter,
   item: orderItemRouter,
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

         if (filter.creator?.length)
            whereConditions.push(inArray(order.creatorId, filter.creator))

         if (filter.archived) {
            whereConditions.push(isNotNull(order.deletedAt))
         } else {
            whereConditions.push(isNull(order.deletedAt))
         }

         if (filter.startDate) {
            whereConditions.push(
               gte(
                  order.createdAt,
                  new Date(new Date(filter.startDate).setHours(0, 0, 0, 0)),
               ),
            )
         }
         if (filter.endDate) {
            whereConditions.push(
               lt(
                  order.createdAt,
                  new Date(new Date(filter.endDate).setHours(23, 59, 59, 999)),
               ),
            )
         }

         if (filter.q?.length) {
            const searchTerm = `%${filter.q.trim().toLowerCase().normalize("NFC")}%`

            whereConditions.push(
               sql`(
                ${order.normalizedName} LIKE ${searchTerm}
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
               desiredPrice: true,
               status: true,
               note: true,
               vat: true,
               client: true,
               analogs: true,
               creatorId: true,
               deletedAt: true,
               deliversAt: true,
               createdAt: true,
            },
            with: {
               items: {
                  columns: {
                     id: true,
                     name: true,
                     quantity: true,
                     desiredPrice: true,
                  },
               },
               creator: {
                  columns: {
                     id: true,
                     name: true,
                     image: true,
                  },
               },
               assignees: {
                  columns: {},
                  with: {
                     user: {
                        columns: {
                           id: true,
                           name: true,
                           image: true,
                        },
                     },
                  },
                  orderBy: [desc(orderAssignee.createdAt)],
               },
               procurements: {
                  columns: {
                     id: true,
                     quantity: true,
                     purchasePrice: true,
                     status: true,
                     note: true,
                     provider: true,
                  },
                  with: {
                     orderItem: {
                        columns: {
                           name: true,
                        },
                     },
                     creator: {
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
      .input(
         createInsertSchema(order)
            .omit({ creatorId: true, shortId: true })
            .extend({
               analogs: z.array(z.string()).default([]),
               items: z
                  .array(createInsertSchema(orderItem).omit({ orderId: true }))
                  .min(1),
            }),
      )
      .mutation(async ({ ctx, input }) => {
         const existingCounter = await ctx.db.query.orderCounter.findFirst({
            where: eq(orderCounter.workspaceId, input.workspaceId),
         })
         const lastId = existingCounter?.lastId ?? 0
         const nextId = lastId + 1

         const normalizedName = input.name
            .normalize("NFC")
            .toLocaleLowerCase("uk")

         const createdOrder = await ctx.db
            .insert(order)
            .values({
               ...input,
               shortId: nextId,
               creatorId: ctx.user.id,
               normalizedName,
            })
            .returning()
            .get()

         const createdOrderItems = await tryCatch(
            ctx.db
               .insert(orderItem)
               .values(
                  input.items.map((item) => ({
                     ...item,

                     orderId: createdOrder.id,
                  })),
               )
               .returning(),
         )

         if (createdOrderItems.error) {
            await ctx.db.delete(order).where(eq(order.id, createdOrder.id))

            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Failed to create order items",
            })
         }

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
            await ctx.db
               .delete(orderItem)
               .where(eq(orderItem.orderId, createdOrder.id))
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
         }

         return { ...createdOrder, items: createdOrderItems.data }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateOrderSchema)
      .mutation(async ({ ctx, input }) => {
         const normalizedName = input.name
            ?.normalize("NFC")
            .toLocaleLowerCase("uk")

         await ctx.db
            .update(order)
            .set({
               ...input,
               normalizedName,
               deletedAt:
                  input.deletedAt === undefined
                     ? undefined
                     : input.deletedAt === null
                       ? null
                       : new Date(input.deletedAt),
            })
            .where(
               and(
                  eq(order.id, input.id),
                  eq(order.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ id: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         await Promise.all([
            ctx.db.delete(procurement).where(eq(procurement.orderId, input.id)),
            ctx.db
               .delete(orderAssignee)
               .where(eq(orderAssignee.orderId, input.id)),
            ctx.db
               .delete(order)
               .where(
                  and(
                     eq(order.id, input.id),
                     eq(order.workspaceId, input.workspaceId),
                  ),
               ),
         ])
      }),
})
