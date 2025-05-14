import { order } from "@ledgerblocks/core/order/schema"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { workspaceAnalyticsFilterSchema } from "@ledgerblocks/core/workspace/analytics/filter"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import {
   type Column,
   type SQL,
   and,
   asc,
   count,
   eq,
   inArray,
   or,
   sql,
   sum,
} from "drizzle-orm"
import { z } from "zod"

type StatsResult = {
   totalOrders: number
   successfulOrders: number
   failedOrders: number
   totalProfit: number
   averageProfitPercentage: number
}
type UserSpecificStatsResult = Record<string, StatsResult>

export const workspaceAnalyticsRouter = t.router({
   stats: t.procedure
      .use(workspaceMemberMiddleware)
      .input(workspaceAnalyticsFilterSchema.extend({ id: z.string() }))
      .query(async ({ ctx, input }) => {
         const selectFields = {
            totalOrders: count(order.id),
            successfulOrders: count(
               sql`CASE WHEN ${order.status} = 'successful' THEN ${order.id} END`,
            ),
            failedOrders: count(
               sql`CASE WHEN ${order.status} != 'successful' THEN ${order.id} END`,
            ),
            averageProfitPercentage: sql<
               number | null
            >`(sum(CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) ELSE 0 END) * 100.0) / nullif(sum(CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * ${procurement.purchasePrice} ELSE 0 END), 0)`.mapWith(
               Number,
            ),
            totalProfit: sum(
               sql`CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) ELSE 0 END`,
            ).mapWith(Number),
         }

         if (input.who[0] === "all") {
            const conditions = [eq(order.workspaceId, input.id)]

            const results = (await ctx.db
               .select(selectFields)
               .from(order)
               .leftJoin(procurement, eq(order.id, procurement.orderId))
               .where(and(...conditions))) satisfies StatsResult[]

            return { all: results[0] } as Record<string, StatsResult>
         }

         const userQueries = input.who.map((userId) => {
            const userConditions: (SQL | undefined)[] = [
               eq(order.workspaceId, input.id),
               or(
                  eq(order.creatorId, userId),
                  eq(procurement.creatorId, userId),
               ),
            ]

            return ctx.db
               .select(selectFields)
               .from(order)
               .leftJoin(procurement, eq(order.id, procurement.orderId))
               .where(and(...userConditions))
         })

         const batchResults = await ctx.db.batch(userQueries as never)

         const userResults = input.who.reduce((acc, userId, index) => {
            acc[userId] = batchResults[index][0]
            return acc
         }, {} as UserSpecificStatsResult)

         return userResults
      }),
   profit: t.procedure
      .use(workspaceMemberMiddleware)
      .input(workspaceAnalyticsFilterSchema.extend({ id: z.string() }))
      .query(async ({ ctx, input }) => {
         const profitExpr = sql`${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice})`
         const formattedDateExpr = sql<string>`strftime('%Y-%m-%d', ${order.createdAt}, 'unixepoch')`

         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
         const selectFields: Record<string, SQL.Aliased | SQL<any> | Column> =
            {}
         const whereConditions: (SQL | undefined)[] = []

         selectFields.date = formattedDateExpr

         // Filter by workspace ID - NO date range filter for all-time data
         whereConditions.push(eq(order.workspaceId, input.id))

         if (input.who[0] === "all") {
            selectFields.all = sum(profitExpr).mapWith(Number)
         } else {
            whereConditions.push(
               or(
                  inArray(order.creatorId, input.who),
                  inArray(procurement.creatorId, input.who),
               ),
            )

            for (const userId of input.who) {
               const userProfitSumExpr = sum(
                  sql`CASE WHEN ${order.creatorId} = ${userId} OR ${procurement.creatorId} = ${userId} THEN ${profitExpr} ELSE 0 END`,
               )
                  .mapWith(Number)
                  .as(userId)

               selectFields[userId] = userProfitSumExpr
            }
         }

         const dailyProfitResults = await ctx.db
            // @ts-expect-error ...
            .select(selectFields)
            .from(order)
            .leftJoin(procurement, eq(order.id, procurement.orderId))
            .where(and(...whereConditions))
            .groupBy(formattedDateExpr)
            .orderBy(asc(formattedDateExpr))

         return dailyProfitResults as {
            date: string
            [key: string]: number | string | null
         }[]
      }),
   orders: t.procedure
      .use(workspaceMemberMiddleware)
      .input(workspaceAnalyticsFilterSchema.extend({ id: z.string() }))
      .query(async ({ ctx, input }) => {
         const formattedDateExpr = sql<string>`strftime('%Y-%m-%d', ${order.createdAt}, 'unixepoch')`

         const selectFields = {
            date: formattedDateExpr,
            value: count(order.id).mapWith(Number),
         }

         const whereConditions = [eq(order.workspaceId, input.id)]

         if (input.who.length > 0 && input.who[0] !== "all") {
            whereConditions.push(inArray(order.creatorId, input.who))
         }

         return await ctx.db
            .select(selectFields)
            .from(order)
            .where(and(...whereConditions))
            .groupBy(formattedDateExpr)
            .orderBy(asc(formattedDateExpr))
      }),
})
