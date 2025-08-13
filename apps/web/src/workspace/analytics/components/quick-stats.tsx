import { trpc } from "@/trpc"
import {
   Stat,
   StatLabel,
   StatValue,
   StatValueSup,
} from "@/workspace/analytics/components/stat"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearch } from "@tanstack/react-router"
import { formatCurrency } from "@unfiddle/core/currency"
import { formatDate } from "@unfiddle/core/date"
import { formatNumber } from "@unfiddle/core/number"
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@unfiddle/ui/components/card"
import { cx } from "@unfiddle/ui/utils"

export function QuickStats() {
   const params = useParams({ from: "/_authed/$workspaceId/_layout/analytics" })
   const search = useSearch({ from: "/_authed/$workspaceId/_layout/analytics" })

   const members = useQuery(
      trpc.workspace.member.list.queryOptions({
         workspaceId: params.workspaceId,
      }),
   )
   const selectedMembers = search.who.includes("all")
      ? [{ user: { id: "all", name: "" } }]
      : members.data?.filter((member) => search.who.includes(member.user.id))

   const stats = useQuery(
      trpc.workspace.analytics.stats.queryOptions({
         id: params.workspaceId,
         ...search,
      }),
   )

   const sourceArray =
      search.period_comparison.length > 0
         ? search.period_comparison
         : selectedMembers

   const sortedTotalOrders = sourceArray
      ?.map((item) => ({
         id: typeof item === "string" ? item : item.user.id,
         label:
            typeof item === "string"
               ? formatDate(item, { month: "short" })
               : item.user.name,
         orders:
            stats.data?.[typeof item === "string" ? item : item.user.id]
               ?.totalOrders ?? 0,
      }))
      .sort((a, b) => b.orders - a.orders)

   const sortedSuccessfulOrders = sourceArray
      ?.map((item) => {
         const id = typeof item === "string" ? item : item.user.id
         const totalOrders = stats.data?.[id]?.totalOrders ?? 0
         const orders = stats.data?.[id]?.successfulOrders ?? 0

         return {
            id,
            label:
               typeof item === "string"
                  ? formatDate(item, { month: "short" })
                  : item.user.name,
            orders,
            percentage: totalOrders > 0 ? (orders / totalOrders) * 100 : 0,
         }
      })
      .sort((a, b) => b.orders - a.orders)

   const sortedFailedOrders = (sourceArray || [])
      ?.map((item) => {
         const id = typeof item === "string" ? item : item.user.id
         const itemStats = stats.data?.[id]
         const totalOrders = itemStats?.totalOrders ?? 0
         const orders = itemStats?.failedOrders ?? 0
         return {
            id: id,
            label:
               typeof item === "string"
                  ? formatDate(item, { month: "short" })
                  : item.user.name,
            orders,
            percentage: totalOrders > 0 ? (orders / totalOrders) * 100 : 0,
         }
      })
      .sort((a, b) => b.orders - a.orders)

   const sortedAverageProfitPercentage = (sourceArray || [])
      ?.map((item) => {
         const id = typeof item === "string" ? item : item.user.id
         return {
            id: id,
            label:
               typeof item === "string"
                  ? formatDate(item, { month: "short" })
                  : item.user.name,
            averageProfitPercentage:
               stats.data?.[id]?.averageProfitPercentage ?? null,
         }
      })
      .sort(
         (a, b) =>
            (b.averageProfitPercentage ?? -Infinity) -
            (a.averageProfitPercentage ?? -Infinity),
      )

   const sortedTotalProfit = (sourceArray || [])
      ?.map((item) => {
         const id = typeof item === "string" ? item : item.user.id
         return {
            id: id,
            label:
               typeof item === "string"
                  ? formatDate(item, { month: "short" })
                  : item.user.name,
            profit: stats.data?.[id]?.totalProfit ?? 0,
         }
      })
      .sort((a, b) => (b.profit ?? -Infinity) - (a.profit ?? -Infinity))

   return (
      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:gap-6 2xl:grid-cols-5">
         <Card className="max-2xl:order-1">
            <CardHeader>
               <CardTitle>Всього замовлень</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedTotalOrders?.map((m) => (
                  <Stat key={m.id}>
                     <StatLabel>{m.label}</StatLabel>
                     <StatValue>{formatNumber(m.orders)}</StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
         <Card className="max-2xl:order-3">
            <CardHeader>
               <CardTitle>Успішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedSuccessfulOrders?.map((m) => (
                  <Stat key={m.id}>
                     <StatLabel>{m.label}</StatLabel>
                     <StatValue>
                        {formatNumber(m.orders)}{" "}
                        {m.percentage > 0 && (
                           <StatValueSup
                              className={cx(
                                 m.percentage >= 75
                                    ? "text-green-9"
                                    : "text-red-9",
                              )}
                           >
                              {formatNumber(+m.percentage.toFixed(0))}%
                           </StatValueSup>
                        )}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="max-2xl:order-4">
            <CardHeader>
               <CardTitle>Неуспішно</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedFailedOrders?.map((m) => (
                  <Stat key={m.id}>
                     <StatLabel>{m.label}</StatLabel>
                     <StatValue>
                        {formatNumber(m.orders)}{" "}
                        {m.percentage > 0 && (
                           <StatValueSup
                              className={cx(
                                 m.percentage > 25
                                    ? "text-red-9"
                                    : "text-green-9",
                              )}
                           >
                              {formatNumber(+m.percentage.toFixed(0))}%
                           </StatValueSup>
                        )}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="max-2xl:order-2">
            <CardHeader>
               <CardTitle>Маржинальність</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedAverageProfitPercentage?.map((m) => (
                  <Stat key={m.id}>
                     <StatLabel>{m.label}</StatLabel>
                     <StatValue
                        className={
                           m.averageProfitPercentage === null
                              ? undefined
                              : m.averageProfitPercentage >= 8
                                ? "text-green-9"
                                : m.averageProfitPercentage < 8
                                  ? "text-red-9"
                                  : undefined
                        }
                     >
                        {m.averageProfitPercentage === null
                           ? "-"
                           : `${formatNumber(m.averageProfitPercentage, { maximumFractionDigits: 1 })}%`}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>

         <Card className="order-last max-2xl:col-span-2">
            <CardHeader>
               <CardTitle>Загальний прибуток</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-neutral">
               {sortedTotalProfit?.map((m) => (
                  <Stat key={m.id}>
                     <StatLabel>{m.label}</StatLabel>
                     <StatValue>
                        {formatCurrency(m.profit, {
                           currency: search.currency,
                           notation: "compact",
                        })}
                     </StatValue>
                  </Stat>
               ))}
            </CardContent>
         </Card>
      </section>
   )
}
