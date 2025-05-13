import { order } from "@ledgerblocks/core/order/schema"
import { procurement } from "@ledgerblocks/core/procurement/schema"
import { t } from "@ledgerblocks/core/trpc/context"
import { workspaceAnalyticsFilterSchema } from "@ledgerblocks/core/workspace/analytics/filter"
import { workspaceMemberMiddleware } from "@ledgerblocks/core/workspace/middleware"
import { type SQL, and, count, eq, or, sql, sum } from "drizzle-orm"
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
            totalOrders: count(order.id).as("totalOrders"),
            successfulOrders: count(
               sql`CASE WHEN ${order.status} = 'successful' THEN ${order.id} END`,
            ).as("successfulOrders"),
            failedOrders: count(
               sql`CASE WHEN ${order.status} != 'successful' THEN ${order.id} END`,
            ).as("failedOrders"),
            totalProfit: sum(
               sql`CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) ELSE 0 END`,
            )
               .mapWith(Number)
               .as("totalProfit"),
            averageProfitPercentage: sql<
               number | null
            >`(sum(CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) ELSE 0 END) * 100.0) / nullif(sum(CASE WHEN ${order.status} = 'successful' THEN ${procurement.quantity} * ${procurement.purchasePrice} ELSE 0 END), 0)`
               .mapWith(Number)
               .as("averageProfitPercentage"),
         }

         if (input.who[0] === "all") {
            const conditions: (SQL | undefined)[] = [
               eq(order.workspaceId, input.id),
            ]

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
               or(eq(order.creatorId, userId), eq(procurement.buyerId, userId)),
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
})
