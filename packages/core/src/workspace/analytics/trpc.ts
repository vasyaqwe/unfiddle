import { TRPCError } from "@trpc/server"
import { CURRENCIES } from "@unfiddle/core/currency/constants"
import { getExchangeRates } from "@unfiddle/core/currency/exchange"
import { order } from "@unfiddle/core/order/schema"
import { procurement } from "@unfiddle/core/procurement/schema"
import { t } from "@unfiddle/core/trpc/context"
import {
   PERIOD_FILTERS_FNS,
   workspaceAnalyticsFilterSchema,
} from "@unfiddle/core/workspace/analytics/filter"
import { workspaceMemberMiddleware } from "@unfiddle/core/workspace/middleware"
import {
   type Column,
   type SQL,
   and,
   asc,
   count,
   eq,
   gte,
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
type StatsResultGroup = Record<string, StatsResult>

export const workspaceAnalyticsRouter = t.router({
   stats: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         workspaceAnalyticsFilterSchema.extend({
            id: z.string(),
            currency: z.enum(CURRENCIES),
         }),
      )
      .query(async ({ ctx, input }) => {
         const rates = await getExchangeRates(ctx.vars.KV, input.currency)
         if (!rates)
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Failed to get exchange rates",
            })

         const baseProfitCalculationExpr = sql`CASE
${sql.join(
   CURRENCIES.map(
      (currency) =>
         sql`WHEN ${order.currency} = ${currency} THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) / ${rates[currency]}`,
   ),
   sql` `,
)}
ELSE ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice})
END`
         const basePurchasePriceCalculationExpr = sql`CASE
${sql.join(
   CURRENCIES.map(
      (currency) =>
         sql`WHEN ${order.currency} = ${currency} THEN ${procurement.quantity} * ${procurement.purchasePrice} / ${rates[currency]}`,
   ),
   sql` `,
)}
ELSE ${procurement.quantity} * ${procurement.purchasePrice}
END`

         const profitExpr = sql`CASE WHEN ${order.status} = 'successful' THEN ${baseProfitCalculationExpr} ELSE 0 END`
         const purchasePriceExpr = sql`CASE WHEN ${order.status} = 'successful' THEN ${basePurchasePriceCalculationExpr} ELSE 0 END`

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
            >`(sum(CASE WHEN ${order.status} = 'successful' THEN ${profitExpr} ELSE 0 END) * 100.0) / nullif(sum(CASE WHEN ${order.status} = 'successful' THEN ${purchasePriceExpr} ELSE 0 END), 0)`.mapWith(
               Number,
            ),
            totalProfit: sum(
               sql`CASE WHEN ${order.status} = 'successful' THEN ${profitExpr} ELSE 0 END`,
            ).mapWith(Number),
         }

         const whereConditions: (SQL | undefined)[] = [
            eq(order.workspaceId, input.id),
         ]

         const formattedMonthlyDateExpr = sql<string>`strftime('%Y-%m', ${order.createdAt}, 'unixepoch')`

         if (
            input.period_comparison.length === 0 &&
            input.period !== "all_time"
         ) {
            const periodFilter = PERIOD_FILTERS_FNS[input.period].gte
            if (!periodFilter) return

            whereConditions.push(gte(order.createdAt, periodFilter))
         }

         if (input.period_comparison.length > 0) {
            if (input.who.length > 0 && !input.who.includes("all")) {
               whereConditions.push(
                  or(
                     inArray(order.creatorId, input.who),
                     inArray(procurement.creatorId, input.who),
                  ),
               )
            }

            const monthQueries = input.period_comparison.map((month) => {
               const monthConditions: (SQL | undefined)[] = [
                  ...whereConditions,
                  eq(formattedMonthlyDateExpr, month),
               ]

               if (input.who.length > 0 && !input.who.includes("all")) {
                  monthConditions.push(
                     or(
                        inArray(order.creatorId, input.who),
                        inArray(procurement.creatorId, input.who),
                     ),
                  )
               }

               return ctx.db
                  .select(selectFields)
                  .from(order)
                  .leftJoin(procurement, eq(order.id, procurement.orderId))
                  .where(and(...monthConditions))
            })

            const batchResults = await ctx.db.batch(monthQueries as never)

            const monthResults = input.period_comparison.reduce(
               (acc, month, index) => {
                  const result = batchResults[index]?.[0]
                  if (!result) return acc
                  acc[month] = result
                  return acc
               },
               {} as StatsResultGroup,
            )

            return monthResults
         }

         if (input.who.length > 0 && !input.who.includes("all")) {
            const userQueries = input.who.map((userId) => {
               const userConditions: (SQL | undefined)[] = [
                  ...whereConditions,
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
               const result = batchResults[index]?.[0]
               if (!result) return acc
               acc[userId] = result
               return acc
            }, {} as StatsResultGroup)

            return userResults
         }

         const results = await ctx.db
            .select(selectFields)
            .from(order)
            .leftJoin(procurement, eq(order.id, procurement.orderId))
            .where(and(...whereConditions))

         return { all: results[0] } as StatsResultGroup
      }),
   profit: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         workspaceAnalyticsFilterSchema.extend({
            id: z.string(),
            currency: z.enum(CURRENCIES),
         }),
      )
      .query(async ({ ctx, input }) => {
         const rates = await getExchangeRates(ctx.vars.KV, input.currency)
         if (!rates) return

         const profitExpr = sql`CASE WHEN ${order.status} = 'successful' THEN (CASE
${sql.join(
   CURRENCIES.map(
      (currency) =>
         sql`WHEN ${order.currency} = ${currency} THEN ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice}) / ${rates[currency]}`,
   ),
   sql` `,
)}
ELSE ${procurement.quantity} * (${order.sellingPrice} - ${procurement.purchasePrice})
END) ELSE 0 END`

         const formattedDateExpr = sql<string>`strftime('%Y-%m-%d', ${order.createdAt}, 'unixepoch')`
         const formattedMonthlyDateExpr = sql<string>`strftime('%Y-%m', ${order.createdAt}, 'unixepoch')`

         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
         const selectFields: Record<string, SQL.Aliased | SQL<any> | Column> =
            {}
         const whereConditions: (SQL | undefined)[] = [
            eq(order.workspaceId, input.id),
         ]

         selectFields.date = formattedDateExpr

         if (
            input.period_comparison.length === 0 &&
            input.period !== "all_time"
         ) {
            const periodFilter = PERIOD_FILTERS_FNS[input.period].gte
            if (!periodFilter) return

            whereConditions.push(gte(order.createdAt, periodFilter))
         }

         if (input.who.length > 0 && !input.who.includes("all")) {
            whereConditions.push(
               or(
                  inArray(order.creatorId, input.who),
                  inArray(procurement.creatorId, input.who),
               ),
            )
         }

         if (input.period_comparison.length > 0) {
            whereConditions.push(
               inArray(formattedMonthlyDateExpr, input.period_comparison),
            )
            for (const month of input.period_comparison) {
               const monthProfitSumExpr = sum(
                  sql`CASE WHEN ${formattedMonthlyDateExpr} = ${month} THEN ${profitExpr} ELSE 0 END`,
               )
                  .mapWith(Number)
                  .as(month)

               selectFields[month] = monthProfitSumExpr
            }
         } else if (input.who[0] === "all") {
            selectFields.all = sum(profitExpr).mapWith(Number)
         } else {
            for (const userId of input.who) {
               const userProfitSumExpr = sum(
                  sql`CASE WHEN ${order.creatorId} = ${userId} OR ${procurement.creatorId} = ${userId} THEN ${profitExpr} ELSE 0 END`,
               )
                  .mapWith(Number)
                  .as(userId)

               selectFields[userId] = userProfitSumExpr
            }
         }

         const result = await ctx.db
            // @ts-expect-error ...
            .select(selectFields)
            .from(order)
            .leftJoin(procurement, eq(order.id, procurement.orderId))
            .where(and(...whereConditions))
            .groupBy(formattedDateExpr)
            .orderBy(asc(formattedDateExpr))

         return result as {
            date: string
            [key: string]: number | string | null
         }[]
      }),
   orders: t.procedure
      .use(workspaceMemberMiddleware)
      .input(
         workspaceAnalyticsFilterSchema.extend({
            id: z.string(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const formattedDateExpr = sql<string>`strftime('%Y-%m-%d', ${order.createdAt}, 'unixepoch')`

         const selectFields = {
            date: formattedDateExpr,
            value: count(order.id).mapWith(Number),
         }

         const whereConditions = [eq(order.workspaceId, input.id)]

         if (input.period !== "all_time") {
            const periodFilter = PERIOD_FILTERS_FNS[input.period].gte
            if (!periodFilter) return

            whereConditions.push(gte(order.createdAt, periodFilter))
         }

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
