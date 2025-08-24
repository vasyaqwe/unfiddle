import { TRPCError } from "@trpc/server"
import {} from "@unfiddle/core/attachment/schema"
import { estimateItem } from "@unfiddle/core/database/schema"
import { estimateFilterSchema } from "@unfiddle/core/estimate/filter"
import { estimateItemRouter } from "@unfiddle/core/estimate/item/trpc"
import {
   estimate,
   estimateCounter,
   updateEstimateSchema,
} from "@unfiddle/core/estimate/schema"
import { createId } from "@unfiddle/core/id"
import { t } from "@unfiddle/core/trpc/context"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import { and, desc, eq, gte, lt, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export const estimateRouter = t.router({
   item: estimateItemRouter,
   one: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            estimateId: z.string(),
            workspaceId: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const found = await ctx.db.query.estimate.findFirst({
            where: and(
               eq(estimate.id, input.estimateId),
               eq(estimate.workspaceId, input.workspaceId),
            ),
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
            },
            orderBy: [desc(estimate.createdAt)],
         })

         return found ?? null
      }),
   list: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         z.object({
            workspaceId: z.string(),
            filter: estimateFilterSchema,
         }),
      )
      .query(async ({ ctx, input }) => {
         const filter = input.filter

         const whereConditions = [eq(estimate.workspaceId, input.workspaceId)]

         if (filter.startDate) {
            whereConditions.push(
               gte(
                  estimate.createdAt,
                  new Date(new Date(filter.startDate).setHours(0, 0, 0, 0)),
               ),
            )
         }
         if (filter.endDate) {
            whereConditions.push(
               lt(
                  estimate.createdAt,
                  new Date(new Date(filter.endDate).setHours(23, 59, 59, 999)),
               ),
            )
         }

         if (filter.q?.length) {
            const searchTerm = `%${filter.q.trim().toLowerCase().normalize("NFC")}%`

            whereConditions.push(
               sql`(
                ${estimate.normalizedName} LIKE ${searchTerm}
                OR
                ${estimate.shortId} LIKE ${searchTerm}
                OR
                ${estimate.sellingPrice} LIKE ${searchTerm}
              )`,
            )
         }

         const estimates = await ctx.db.query.estimate.findMany({
            where: and(...whereConditions),
            columns: {
               id: true,
               shortId: true,
               name: true,
               currency: true,
               sellingPrice: true,
               createdAt: true,
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
            orderBy: [desc(estimate.createdAt)],
         })

         return estimates
      }),
   create: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         createInsertSchema(estimate)
            .omit({ creatorId: true, shortId: true })
            .extend({
               items: z
                  .array(
                     createInsertSchema(estimateItem).omit({
                        estimateId: true,
                     }),
                  )
                  .min(1),
            }),
      )
      .mutation(async ({ ctx, input }) => {
         const existingCounter = await ctx.db.query.estimateCounter.findFirst({
            where: eq(estimateCounter.workspaceId, input.workspaceId),
         })
         const lastId = existingCounter?.lastId ?? 0
         const nextId = lastId + 1
         const normalizedName = input.name
            .normalize("NFC")
            .toLocaleLowerCase("uk")

         const estimateId = createId("estimate")

         const batchQueries: BatchItem[] = []

         batchQueries.push(
            ctx.db.insert(estimate).values({
               ...input,
               id: estimateId,
               shortId: nextId,
               creatorId: ctx.user.id,
               normalizedName,
            }),
         )

         const BATCH_SIZE = 5
         for (let i = 0; i < input.items.length; i += BATCH_SIZE) {
            const batch = input.items.slice(i, i + BATCH_SIZE)
            batchQueries.push(
               ctx.db.insert(estimateItem).values(
                  batch.map((item) => ({
                     ...item,
                     workspaceId: input.workspaceId,
                     estimateId,
                  })),
               ),
            )
         }

         if (!existingCounter) {
            batchQueries.push(
               ctx.db
                  .insert(estimateCounter)
                  .values({ workspaceId: input.workspaceId })
                  .onConflictDoNothing(),
            )
         }
         batchQueries.push(
            ctx.db
               .update(estimateCounter)
               .set({ lastId: nextId })
               .where(eq(estimateCounter.workspaceId, input.workspaceId)),
         )

         await ctx.db.batch(
            batchQueries as unknown as readonly [
               BatchItem<"sqlite">,
               ...BatchItem<"sqlite">[],
            ],
         )

         return {
            ...input,
            id: estimateId,
            shortId: nextId,
            creatorId: ctx.user.id,
            normalizedName,
         }
      }),
   update: t.procedure
      .use(workspaceMemberMiddleware)
      .input(updateEstimateSchema)
      .mutation(async ({ ctx, input }) => {
         const normalizedName = input.name
            ?.normalize("NFC")
            .toLocaleLowerCase("uk")

         await ctx.db
            .update(estimate)
            .set({
               ...input,
               normalizedName,
            })
            .where(
               and(
                  eq(estimate.id, input.estimateId),
                  eq(estimate.workspaceId, input.workspaceId),
               ),
            )
      }),
   delete: t.procedure
      .use(workspaceMemberMiddleware)
      .input(z.object({ estimateId: z.string(), workspaceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         if (ctx.membership.role !== "owner" && ctx.membership.role !== "admin")
            throw new TRPCError({
               code: "FORBIDDEN",
            })

         await ctx.db.batch([
            ctx.db
               .delete(estimate)
               .where(
                  and(
                     eq(estimate.id, input.estimateId),
                     eq(estimate.workspaceId, input.workspaceId),
                  ),
               ),
            // ctx.db
            //    .delete(attachment)
            //    .where(
            //       and(
            //          eq(attachment.subjectId, input.estimateId),
            //          eq(attachment.workspaceId, input.workspaceId),
            //       ),
            //    ),
         ])
      }),
})
